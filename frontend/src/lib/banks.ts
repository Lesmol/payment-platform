export interface Bank {
  name: string
  branchCode: string
}

export const BANKS: Bank[] = [
  { name: "ABSA", branchCode: "632005" },
  { name: "African Bank", branchCode: "430000" },
  { name: "Capitec", branchCode: "470010" },
  { name: "Discovery Bank", branchCode: "679000" },
  { name: "FNB", branchCode: "250655" },
  { name: "Investec", branchCode: "580105" },
  { name: "Nedbank", branchCode: "198765" },
  { name: "Standard Bank", branchCode: "051001" },
  { name: "TymeBank", branchCode: "678910" },
]

export function bankName(branchCode: string): string {
  return (
    BANKS.find((bank) => bank.branchCode === branchCode)?.name ?? branchCode
  )
}
