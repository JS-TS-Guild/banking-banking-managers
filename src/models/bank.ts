import { idGenerator } from "@/utils/idgen";
import BankAccount from "./bank-account";
import User from "./user";
import GlobalRegistry from "@/services/GlobalRegistry";
import TransactionService from "@/services/TransactionService";
import { BankAccountId, BankId, UserId } from "@/types/Common";

export default class Bank {
    private id: string;
    private isNegativeAllowed: boolean;
    private bankAccounts:{};

    // Gives an unique ID to the Bank created
    constructor(options?: {isNegativeAllowed?: boolean}){
        this.id = idGenerator();
        this.bankAccounts = {};

        if(options == undefined){
            this.isNegativeAllowed = false
        }else{
            this.isNegativeAllowed = options.isNegativeAllowed;
        }
    }

    // Returns an instance of the class Bank
    static create(options?: {isNegativeAllowed?: boolean}): Bank{
        const bank = new Bank(options);
        GlobalRegistry.addBank(bank.getId(), bank)
        return bank;
    }

    // Returns the ID of the bank
    getId(): string{
        return this.id;
    }

    getBankAllowsNegative(): boolean{
        return this.isNegativeAllowed;
    }

    createAccount(initialBalance: number): BankAccount{
        const account = new BankAccount(initialBalance, this.id)
        this.bankAccounts[account.getId()] = account;
        
        return account;
    }

    getAccount(accountId: BankAccountId): BankAccount | null{
        if (this.bankAccounts.hasOwnProperty(accountId)) {
            return this.bankAccounts[accountId];
        } else {
            console.log(`Account doesn't exist.`);
            return null;
        }
    }

    send(senderUserId: UserId, receiverUserId: UserId, amount: number, receiverBankId?: BankId){
        let allBanks = GlobalRegistry.getBanks();
        let bankAllowsNegative: boolean

        let sender: User = GlobalRegistry.getUser(senderUserId)
        let senderBankAccount: BankAccount;
        let senderBankAccounts: BankAccount[] = [];
        let senderAccountIds = sender.getAccounts();

        let receiver: User = GlobalRegistry.getUser(receiverUserId)
        let receiverBankAccount: BankAccount;
        let receiverAccountIds = receiver.getAccounts();
        
        // Fetching Receiver Bank Account
        if(receiverBankId){
            let bank = allBanks[receiverBankId]
            for(let i = 0; i < receiverAccountIds.length; i++){
                receiverBankAccount = bank.getAccount(receiverAccountIds[i])
                if(receiverBankAccount !== null){
                    break;
                }
            }
        }else{
            for(const bankId in allBanks){
                const bank = allBanks[bankId]
                let receiverAccountFound = false;
                for(let i = 0; i < receiverAccountIds.length; i++){
                    receiverBankAccount = bank.getAccount(receiverAccountIds[i])
                    if(receiverBankAccount !== null){
                        receiverAccountFound = true
                        break;
                    }
                }
                if(receiverAccountFound){
                    break
                }
            }
        }
        
        //Fetching Sender Bank Account
        for(const accountId of senderAccountIds){
            senderBankAccount = this.getAccount(accountId)
            bankAllowsNegative = this.getBankAllowsNegative()
            if(senderBankAccount !== null){
                senderBankAccounts.push(senderBankAccount)
            }
        }
        TransactionService.makeTransaction(senderBankAccounts, receiverBankAccount, amount, bankAllowsNegative, sender)

    }
}