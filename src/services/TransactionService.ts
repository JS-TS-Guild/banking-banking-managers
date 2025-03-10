import BankAccount from "@/models/bank-account";
import User from "@/models/user";

export default class TransactionService{
    static makeTransaction(senderAccounts: BankAccount[], receiverAccount:BankAccount, amount: number, bankAllowsNegative: boolean, sender: User){
        let remainingBalance = amount
        
        // Use all senders accounts to debit the amount
        for(let i = 0; i < senderAccounts.length; i++){
            const senderAccountBalance = senderAccounts[i].getBalance()
            let debitAmount = Math.min(remainingBalance, senderAccountBalance)

            senderAccounts[i].debit(debitAmount)
            sender.setAccounts(senderAccounts[i].getId())
            remainingBalance -= debitAmount

            if(remainingBalance <= 0){
                break;
            }
            
        }

        // if balance remains, check if bank allows negative if it doesn't throw error
        if(remainingBalance > 0){
            if(bankAllowsNegative){
                senderAccounts[0].debit(remainingBalance)   
            }else{
                throw new Error("Insufficient funds")
            }
        }
        
        receiverAccount.credit(amount)
    }
        

}