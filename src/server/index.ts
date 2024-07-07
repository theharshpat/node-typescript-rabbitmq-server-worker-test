import express from 'express';
import amqp from 'amqplib';
import { Task, TaskType, TaskPriority, TaskRequest, QueueMessage } from '@/shared';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

const QUEUE_NAME = 'priority_tasks';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

let channel: amqp.Channel;

async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { 
      durable: true,
      maxPriority: Math.max(...Object.values(TaskPriority).filter(v => typeof v === 'number'))
    });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
}

function generateTasks(request: TaskRequest): Task[] {
  const tasks: Task[] = [];

  // Generate a high priority task
  tasks.push({
    id: uuidv4(),
    type: request.type,
    priority: TaskPriority.HIGH,
    data: `High priority ${request.data}`
  });

  // Generate a medium priority task
  tasks.push({
    id: uuidv4(),
    type: request.type,
    priority: TaskPriority.MEDIUM,
    data: `Medium priority ${request.data}`
  });

  // Generate a low priority task
  tasks.push({
    id: uuidv4(),
    type: request.type,
    priority: TaskPriority.LOW,
    data: `Low priority ${request.data}`
  });

  return tasks;
}

app.post('/task', async (req, res) => {
  const taskRequest: TaskRequest = req.body;

  if (!Object.values(TaskType).includes(taskRequest.type)) {
    return res.status(400).json({ error: 'Invalid task type' });
  }

  const tasks = generateTasks(taskRequest);

  for (const task of tasks) {
    const message: QueueMessage = { task };
    await channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(message)),
      { priority: task.priority }
    );
  }

  res.json({ message: 'Tasks sent to queue', taskCount: tasks.length });
});

async function startServer() {
  await setupRabbitMQ();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);