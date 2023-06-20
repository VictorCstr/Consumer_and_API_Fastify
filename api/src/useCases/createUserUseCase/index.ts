import { QueueRabbitProvider } from "../../providers/QueueRabbitProvider";
import { MySqlUserRepository } from "../../repositories/MySqlUserRepository";
import { CreateUserUseCase } from "./createUserUseCase";

const userRepository = new MySqlUserRepository();

const queueProvider = new QueueRabbitProvider();

const createUserUseCase = new CreateUserUseCase(userRepository, queueProvider);

export { createUserUseCase };