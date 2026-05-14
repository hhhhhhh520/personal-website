import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { projects, type Project } from '@/data/projects';

function getClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.ASTRON_API_KEY,
    baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
  });
}

// System prompt for Nova AI assistant
const SYSTEM_PROMPT = `你是 Nova，苏畅的 AI 向导。

关于苏畅：
- 身份：AI 应用开发者，湖南农业大学学生（2023-2027）
- 核心技能：RAG 系统、多 Agent 架构、全栈开发
- 项目数量：6 个核心项目，包括校园百事通、Mini Claude Code 等
- 技术栈：Python、TypeScript、LangChain、FastAPI、React

你的任务：
1. 帮助访客了解苏畅的技能和项目
2. 回答关于网站功能的问题
3. 以友好、专业的方式与访客互动
4. 可以根据访客兴趣推荐浏览网站的不同部分

回答风格：
- 简洁明了，避免冗长
- 可以使用 emoji 增加亲和力
- 如果不知道具体信息，诚实地说明`;

/**
 * 构建项目上下文字符串
 * @param project - 项目数据
 * @returns 格式化的项目上下文
 */
function buildProjectContext(project: Project): string {
  const statusMap: Record<string, string> = {
    'completed': '已完成',
    'in-progress': '进行中',
    'archived': '已归档',
  };

  const categoryMap: Record<string, string> = {
    'ai': 'AI 应用',
    'android': 'Android 应用',
    'web': 'Web 应用',
    'tool': '工具',
  };

  let context = `
## 当前浏览项目：${project.name}

**简介**：${project.shortDesc}

**详细介绍**：${project.fullDesc}

**技术栈**：${project.techStack.join('、')}

**亮点**：${project.highlights.join('、')}

**分类**：${categoryMap[project.category] || project.category}

**状态**：${statusMap[project.status] || project.status}

**开始时间**：${project.startDate}`;

  if (project.endDate) {
    context += `\n**完成时间**：${project.endDate}`;
  }

  if (project.github) {
    context += `\n**GitHub**：${project.github}`;
  }

  if (project.demo) {
    context += `\n**在线演示**：${project.demo}`;
  }

  context += `

## 回答建议
- 针对这个项目回答用户问题，使用上述详细信息
- 如果用户问技术细节，重点介绍技术栈和亮点
- 如果用户问项目状态，告知当前状态和时间线
- 可以引导用户访问 GitHub 或演示链接`;

  return context;
}

interface ChatRequest {
  message: string;
  projectId?: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(req: NextRequest) {
  try {
    // Check for API key - detect placeholder values
    const apiKey = process.env.ASTRON_API_KEY;
    const isPlaceholder = !apiKey ||
      apiKey.includes('placeholder') ||
      apiKey.includes('your_api_key') ||
      apiKey === 'sk-placeholder-key-for-build' ||
      apiKey.length < 20;

    if (isPlaceholder) {
      console.error('[Chat API] ASTRON_API_KEY not configured or is placeholder');
      return NextResponse.json(
        {
          error: 'API_KEY_NOT_CONFIGURED',
          message: 'AI 功能需要配置 ASTRON_API_KEY，请在 .env.local 中设置您的讯飞星辰 Coding Plan API Key。'
        },
        { status: 503 }
      );
    }

    const body: ChatRequest = await req.json();
    const { message, projectId, messages = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context with project info if provided
    let contextualPrompt = SYSTEM_PROMPT;
    if (projectId) {
      // Find the project by ID
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        // Inject full project context
        contextualPrompt += buildProjectContext(project);
      } else {
        // Project ID provided but not found - add generic context
        contextualPrompt += `\n\n注意：访客正在浏览一个项目页面（ID: ${projectId}), 但该项目的详细信息暂未加载。请根据一般知识回答，或引导访客查看项目列表页面。`;
      }
    }

    // Build messages array for API
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: contextualPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ];

    // Call Astron Coding Plan API with streaming
    const client = getClient();
    const stream = await client.chat.completions.create({
      model: 'astron-code-latest',
      messages: apiMessages,
      stream: true,
      max_tokens: 500,
    });

    // Create SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('[Chat API] Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Rate limit error
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // API key error
      if (error.message.includes('401') || error.message.includes('invalid api key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 500 }
        );
      }

      // Network error
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection.' },
          { status: 503 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
