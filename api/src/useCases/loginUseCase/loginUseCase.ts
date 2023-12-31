import { ILoginDTO } from "./loginDTO";
import { ApiError } from "../../errors";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { Login } from "../../entities/Login";

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: ILoginDTO): Promise<Login> {
    const { password, username } = data;

    const existUser = await this.userRepository.existUser(username);

    if (existUser != true) {
      throw new ApiError(404, "Usuário não existente");
    }

    const user = await this.userRepository.getUser(username);

    if (user.id == undefined) {
      throw new ApiError(404, "Usuário não cadastrado ainda");
    }

    const correctPassword = await this.userRepository.verify(
      username,
      password
    );

    if (correctPassword != true) {
      throw new ApiError(403, "Dados incorretos");
    }

    return { id: user.id, username: user.username };
  }
}
