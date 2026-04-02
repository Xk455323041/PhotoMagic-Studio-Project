import { randomUUID } from 'crypto';
import { IDPhotoParams, ProcessingResult } from '../types';
import { getFilePath } from './fileService';
import { processIDPhotoWithVeLMagicX } from './idPhotoProxyService';
import logger from '../config/logger';

export type IDPhotoTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IDPhotoTaskRecord {
  taskId: string;
  fileId: string;
  status: IDPhotoTaskStatus;
  parameters: IDPhotoParams;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: ProcessingResult;
  error?: string;
}

const tasks = new Map<string, IDPhotoTaskRecord>();
const TASK_TTL_MS = 24 * 60 * 60 * 1000;

function cloneTask(task: IDPhotoTaskRecord): IDPhotoTaskRecord {
  return JSON.parse(JSON.stringify(task));
}

async function fileToBase64(filePath: string): Promise<string> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

export async function createIDPhotoTask(
  fileId: string,
  parameters: IDPhotoParams = {}
): Promise<IDPhotoTaskRecord> {
  const taskId = `task_${randomUUID().replace(/-/g, '')}`;
  const now = new Date().toISOString();

  const task: IDPhotoTaskRecord = {
    taskId,
    fileId,
    status: 'pending',
    parameters,
    createdAt: now,
  };

  tasks.set(taskId, task);

  void runIDPhotoTask(taskId).catch((error: any) => {
    logger.error('Unhandled ID photo task execution error', {
      taskId,
      fileId,
      error: error?.message || 'Unknown error',
      stack: error?.stack || null,
    });
  });

  return cloneTask(task);
}

export function getIDPhotoTask(taskId: string): IDPhotoTaskRecord | null {
  const task = tasks.get(taskId);
  return task ? cloneTask(task) : null;
}

async function runIDPhotoTask(taskId: string): Promise<void> {
  const task = tasks.get(taskId);
  if (!task) {
    return;
  }

  task.status = 'processing';
  task.startedAt = new Date().toISOString();
  tasks.set(taskId, task);

  const start = Date.now();

  try {
    logger.info('Starting async ID photo task', {
      taskId,
      fileId: task.fileId,
      parameterKeys: Object.keys(task.parameters || {}),
    });

    const filePath = await getFilePath(task.fileId);
    const imageBase64 = await fileToBase64(filePath);
    const result = await processIDPhotoWithVeLMagicX(imageBase64, task.parameters);

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.result = result;
    tasks.set(taskId, task);

    logger.info('Async ID photo task completed', {
      taskId,
      fileId: task.fileId,
      resultId: result.resultId,
      durationMs: Date.now() - start,
    });
  } catch (error: any) {
    task.status = 'failed';
    task.completedAt = new Date().toISOString();
    task.error = error?.message || '证件照处理失败';
    tasks.set(taskId, task);

    logger.error('Async ID photo task failed', {
      taskId,
      fileId: task.fileId,
      durationMs: Date.now() - start,
      error: error?.message || 'Unknown error',
      stack: error?.stack || null,
    });
  }
}

export function cleanupExpiredIDPhotoTasks(): void {
  const now = Date.now();

  for (const [taskId, task] of tasks.entries()) {
    const referenceTime = task.completedAt || task.createdAt;
    const taskTime = new Date(referenceTime).getTime();

    if (!Number.isNaN(taskTime) && now - taskTime > TASK_TTL_MS) {
      tasks.delete(taskId);
    }
  }
}

setInterval(cleanupExpiredIDPhotoTasks, 60 * 60 * 1000);
