import amqplib from 'amqplib'
export async function connect() {
    return amqplib.connect(process.env.RABBIT_URL as string)
        .then(conn => conn.createChannel());
}

async function createQueue(channel: amqplib.Channel, queue: string): Promise<amqplib.Channel> {
    return new Promise<amqplib.Channel>((resolve, reject) => {
        try {
            channel.assertQueue(queue, { durable: false  });
            resolve(channel);
        }
        catch (err) { reject(err) }
    });
}
async function sendToQueue(queue: string, message: any) {
    connect()
        .then(channel => createQueue(channel, queue))
        .then((channel: amqplib.Channel) => channel.sendToQueue(queue, Buffer.from(JSON.stringify(message))))
        .catch(err => console.log(err))
}
async function consume(queue: string, callback: (msg: amqplib.ConsumeMessage | null) => void) {
    connect()
        .then(channel => createQueue(channel, queue))
        .then(channel => channel.consume(queue, callback, { noAck:true }))
        .catch(err => console.log(err));
}

export { consume, sendToQueue }