import express from 'express';
import amqp from 'amqplib';
import { Task, TaskType, TaskPriority, QueueMessage } from '@/shared';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

const QUEUE_NAME = 'priority_tasks';

let channel: amqp.Channel;

async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
}

app.post('/task', async (req, res) => {
  const { type, data } = req.body;
  const priority = parseInt(req.query.priority as string) || TaskPriority.MEDIUM;

  if (!Object.values(TaskType).includes(type)) {
    return res.status(400).json({ error: 'Invalid task type' });
  }

  const task: Task = {
    id: uuidv4(),
    type,
    priority,
    data
  };

  const message: QueueMessage = { task, priority: task.priority };

  await channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(message)),
    { priority: task.priority }
  );

  res.json({ message: 'Task sent to queue', taskId: task.id });
});

async function startServer() {
  await setupRabbitMQ();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);