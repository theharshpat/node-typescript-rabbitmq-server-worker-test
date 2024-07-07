import amqp from 'amqplib';
import { Task, TaskType, QueueMessage, TaskResult } from '@/shared';

const QUEUE_NAME = 'priority_tasks';

async function processTask(task: Task): Promise<TaskResult> {
  console.log(`Processing task: ${task.id}, Type: ${task.type}, Priority: ${task.priority}`);
  
  switch (task.type) {
    case TaskType.DATA_PROCESSING:
      return await processDataTask(task);
    case TaskType.IMAGE_RECOGNITION:
      return await processImageTask(task);
    case TaskType.TEXT_ANALYSIS:
      return await processTextTask(task);
    default:
      throw new Error(`Unknown task type: ${task.type}`);
  }
}

async function processDataTask(task: Task): Promise<TaskResult> {
  // Simulate complex data processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  const processedData = task.data.split('').reverse().join('');
  return {
    taskId: task.id,
    result: `Processed data: ${processedData}`
  };
}

async function processImageTask(task: Task): Promise<TaskResult> {
  // Simulate image recognition
  await new Promise(resolve => setTimeout(resolve, 3000));
  const recognizedObjects = ['car', 'tree', 'building'];
  return {
    taskId: task.id,
    result: `Recognized objects in image: ${recognizedObjects.join(', ')}`
  };
}

async function processTextTask(task: Task): Promise<TaskResult> {
  // Simulate text analysis
  await new Promise(resolve => setTimeout(resolve, 1500));
  const wordCount = task.data.split(' ').length;
  const sentiment = Math.random() > 0.5 ? 'positive' : 'negative';
  return {
    taskId: task.id,
    result: `Text analysis: ${wordCount} words, sentiment: ${sentiment}`
  };
}

async function startWorker() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    console.log('Worker is running, waiting for tasks...');

    channel.prefetch(1);  // Process one message at a time

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const message: QueueMessage = JSON.parse(msg.content.toString());
        const { task } = message;
        
        try {
          const result = await processTask(task);
          console.log('Task result:', result);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing task:', error);
          channel.nack(msg, false, false);  // Don't requeue the message
        }
      }
    });
  } catch (error) {
    console.error('Worker error:', error);
    process.exit(1);
  }
}

startWorker().catch(console.error);