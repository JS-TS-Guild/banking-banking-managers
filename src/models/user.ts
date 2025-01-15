import GlobalRegistry from "@/services/GlobalRegistry";
import { BankAccountId, UserId } from "@/types/Common";
import { idGenerator } from "@/utils/idgen";

export default class User {
  private userName: string;
  private bankAccounts: string[];
  private userId: string;

  constructor(username: string, bankAccounts: BankAccountId[]){
    this.userName = username;
    this.bankAccounts = [...bankAccounts];
    this.userId = idGenerator();
    
  }

  static create(userName: string, bankAccounts: BankAccountId[]): User{
    const user =  new User(userName, bankAccounts)
    GlobalRegistry.addUser(user.getId(), user)
    return user
  }

  getId(){
    return this.userId;
  }

  static getUser(userId: UserId){
    return GlobalRegistry.getUser(userId)
  }

  setAccounts(accountId: BankAccountId){
    const accountIndex = this.bankAccounts.indexOf(accountId)

    this.bankAccounts.splice(accountIndex,1)
    this.bankAccounts.unshift(accountId)
  }

  getAccounts(){
    return this.bankAccounts;
  }
}