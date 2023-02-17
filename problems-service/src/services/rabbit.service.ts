import amqplib from 'amqplib'
export default class RabbitService {
    private async connect() {
        return amqplib.connect(process.env.RABBIT_URL as string)
            .then(conn => conn.createChannel());
    }

    private async createQueue(channel:amqplib.Channel, queue : string) :Promise<amqplib.Channel> {
       return new Promise<amqplib.Channel>((resolve, reject) => {
           try {
               channel.assertQueue(queue, { durable: true });
               resolve(channel);
           }
           catch (err) { reject(err) }
       });
    }
    public async sendToQueue(queue : string, message:string) {
        this.connect()
            .then(channel => this.createQueue(channel, queue))
            .then((channel : amqplib.Channel) => channel.sendToQueue(queue, Buffer.from(JSON.stringify(message))))
            .catch(err => console.log(err))
    }
    public async consume(queue : string, callback : (msg: amqplib.ConsumeMessage | null) => void) {
        this.connect()
            .then(channel => this.createQueue(channel, queue))
            .then(channel => channel.consume(queue, callback, { noAck: true }))
            .catch(err => console.log(err));
    }
}