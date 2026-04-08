import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "ride-service",
  brokers: [(process.env.KAFKA_BROKER || "localhost:9092")]
});

export const producer = kafka.producer();

export async function emit(topic, payload) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }]
  });
}
