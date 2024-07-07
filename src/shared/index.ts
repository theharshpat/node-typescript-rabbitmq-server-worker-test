export enum TaskType {
  DATA_PROCESSING = 'DATA_PROCESSING',
  IMAGE_RECOGNITION = 'IMAGE_RECOGNITION',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS'
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

export interface Task {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  data: string;
}

export interface TaskResult {
  taskId: string;
  result: string;
}

export interface QueueMessage {
  task: Task;
  priority: number;
}
