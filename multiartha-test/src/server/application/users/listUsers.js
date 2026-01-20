import { userRepo } from "../../infrastructure/repositories/userRepo";

export async function listUsers() {
  return userRepo.listWithRole();
}
