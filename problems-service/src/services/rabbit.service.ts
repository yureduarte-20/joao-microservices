import { generateUniqueId } from '@loopback/core';
import amqplib from 'amqplib'
export default class RabbitService {
    private async connect() {
        return amqplib.connect(process.env.RABBIT_URL as string)
            .then(conn => conn.createChannel());
    }

    private async createQueue(channel: amqplib.Channel, queue: string, options?: amqplib.Options.AssertQueue): Promise<amqplib.Channel> {
        return new Promise<amqplib.Channel>((resolve, reject) => {
            try {
                channel.assertQueue(queue, options ?? { durable: false });
                resolve(channel);
            }
            catch (err) { reject(err) }
        });
    }
    public async sendToQueue(queue: string, message: any, err?: (e: Error) => void, options?: amqplib.Options.Publish) {
        this.connect()
            .then(channel => this.createQueue(channel, queue))
            .then((channel: amqplib.Channel) => channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options))
            .catch(err)
    }
    public async consume(queue: string, callback: (msg: amqplib.ConsumeMessage | null) => Promise<void>, err?: (e: Error) => void) {
        this.connect()
            .then(channel => this.createQueue(channel, queue))
            .then(channel => channel.consume(queue, callback, { noAck: true }))
            .catch(err);
    }
    public async sendAndWait(queue: string, data: any, cb: (data: any) => void, err?: (e: Error) => void) {
        this.connect().then(ch => {
            ch.assertQueue('', { exclusive: true }).then(q => {
                const corr = generateUniqueId();

                ch.consume(q.queue, (msg) => {
                    console.log('consumidno')
                    if (!msg) return err&& err(new Error('Estourou o tempo limite'))
                    if (msg.properties.correlationId === corr) {
                        //console.log('recebido')
                        //console.log(` [.] Got ${msg.content.toString()}`);
                        cb(JSON.parse(msg.content.toString()))
                    }
                }, { noAck: true });

                ch.sendToQueue(queue,
                    Buffer.from(JSON.stringify(data)),
                    { correlationId: corr, replyTo: q.queue, contentType:'application/json' });
            })
        })
    }
    public consumeAndReturn(queue: string,
        callback: (d:any) => Promise<any>,
        err?: (e: Error) => void) {
        this.connect().then(async channel => {
            channel.assertQueue(queue, { durable: false });
            channel.prefetch(1);
            channel.consume(queue, async function reply(msg) {
                if (!msg) return
                
                let msgReturn = "";
                const data = await callback(JSON.parse(msg.content.toString()))
                let optionsPublish = {
                    correlationId: msg.properties.correlationId
                };
                console.log(msg.properties)
                console.log(msg.content)
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(data)),
                    optionsPublish
                );
                channel.ack(msg);

            }).catch(err);
        })
    }
}