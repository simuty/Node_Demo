import * as amqp from 'amqplib'

const url = `amqp://localhost:5672`;

(async function publish() {
    const exchange = 'delayed-exchange';
    const exchangeType = 'x-delayed-message';
    const routingKey = 'delayed-routingKey';
    const queueName = 'delayed-queue';
    try {
        const connect = await amqp.connect(url);
        const channel = await connect.createChannel();
        await channel.assertExchange(exchange, exchangeType, { durable: true, arguments: { 'x-delayed-type': 'direct' } })
        const queueA = await channel.assertQueue(queueName);

        await channel.bindQueue(queueA.queue, exchange, routingKey);
        await channel.consume(queueA.queue, msg => {
            console.log("接受到的消息", msg.content.toString());
            const num = msg.content.toString()
            if(Number(num) > 3) {
                channel.ack(msg, false);
            } else {
                channel.nack(msg, false, true);
            }
        }, { noAck: true });
    } catch (error) {
        console.log(error);
    }
})();

