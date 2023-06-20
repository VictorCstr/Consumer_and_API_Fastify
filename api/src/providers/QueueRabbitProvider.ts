import { Channel, Connection, connect } from "amqplib";

type Action = (msg: any, channel: Channel) => Promise<void>;

export class QueueRabbitProvider {
  private _conn: Connection;
  private _channel: Channel;

  private static _instance;
  private _client;

  static getInstance(): QueueRabbitProvider {
    if (!QueueRabbitProvider._instance) {
      QueueRabbitProvider._instance = new QueueRabbitProvider();
    }
    return QueueRabbitProvider._instance;
  }

  async initialize(config) {
    const { QUEUE_URL } = process.env;

    this._conn = await connect(QUEUE_URL);
    this._channel = await this._conn.createChannel();

    // create exchanges
    Promise.all(
      [].concat(
        config.exchanges?.map((exchange) =>
          this._channel.assertExchange(exchange.name, exchange.type, {
            durable: true,
          })
        )
      )
    );

    // create queues
    Promise.all(
      [].concat(
        config.queues?.map((queue) =>
          this._channel.assertQueue(queue.name, {
            durable: true,
            deadLetterExchange: queue.dlx,
            messageTtl: queue.ttl,
          })
        )
      )
    );

    // bind all
    Promise.all(
      [].concat(
        config.bindings?.map((binding) =>
          this._channel.bindQueue(binding.target, binding.exchange, binding.key)
        )
      )
    );

    this._conn.on("error", (err) => {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });

    this._conn.on("close", function () {
      console.error("[AMQP] reconnecting");
      return setTimeout(
        () => QueueRabbitProvider.getInstance().initialize(config),
        1000
      );
    });

    console.log("[AMQP] connected");
  }

  async publish({
    exchange,
    routingKey,
    content,
    options,
  }: {
    exchange: string;
    routingKey?: string;
    content: any;
    options?: any;
  }): Promise<void> {
    await this._channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(content)),
      { persistent: true, ...options }
    );
  }
}
