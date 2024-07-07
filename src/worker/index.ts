import amqp from 'amqplib';
import { Task, TaskType, QueueMessage, TaskPriority } from '@/shared';

const QUEUE_NAME = 'priority_tasks';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function processTask(task: Task): Promise<string> {
  console.log(`Processing task: ${task.id}, Type: ${task.type}, Priority: ${task.priority}`);
  
  // Simulate processing time based on task type
  const processingTime = task.type === TaskType.DATA_PROCESSING ? 2000 :
                         task.type === TaskType.IMAGE_RECOGNITION ? 3000 : 1500;
  
  await new Promise(resolve => setTimeout(resolve, processingTime));

  return `Processed task ${task.id} of type ${task.type} with priority ${task.priority}`;
}

async function startWorker() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertQueue(QUEUE_NAME, { 
      durable: true,
      maxPriority: Math.max(...Object.values(TaskPriority).filter(v => typeof v === 'number'))
    });
    
    console.log('Worker is running, waiting for tasks...');

    channel.prefetch(1); // Process one message at a time

    let isProcessing = false;

    setInterval(async () => {
      if (!isProcessing) {
        const queueInfo = await channel.checkQueue(QUEUE_NAME);
        if (queueInfo.messageCount === 0) {
          console.log('No tasks in the queue.');
        }
      }
    }, 2000);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        isProcessing = true;
        const message: QueueMessage = JSON.parse(msg.content.toString());
        const { task } = message;
        
        try {
          const result = await processTask(task);
          console.log('Task result:', result);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing task:', error);
          channel.nack(msg, false, false);  // Don't requeue the message
        } finally {
          isProcessing = false;
        }
      }
    });
  } catch (error) {
    console.error('Worker error:', error);
    process.exit(1);
  }
}

startWorker().catch(console.error);