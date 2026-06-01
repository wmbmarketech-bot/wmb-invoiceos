import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const mapInvoice = row => ({
  id: row.id, companyId: row.company_id,
  client: { name: row.client_name||"", email: row.client_email||"", vat: row.client_vat||"", address: row.client_address||"", reg: row.client_reg||"" },
  clientType: row.client_type||"business", date: row.date, status: row.status,
  paymentMethod: row.payment_method, source: row.source,
  items: typeof row.items === "string" ? JSON.parse(row.items) : row.items || [],
})
export const mapCompany = row => ({
  id: row.id, legalName: row.legal_name, tradeName: row.trade_name,
  website: row.website||"", address: row.address||"", vat: row.vat||"",
  email: row.email||"", phone: row.phone||"", reg: row.reg||"", color: row.color||"#38bdf8",
  bank: { name: row.bank_name||"", iban: row.bank_iban||"", swift: row.bank_swift||"", holder: row.bank_holder||"" },
})
export const mapExpense = row => ({
  id: row.id, supplier: row.supplier||"", date: row.date, category: row.category||"Materials",
  net: row.net||0, vatIn: row.vat_in||0, paymentMethod: row.payment_method||"IBAN transfer",
  notes: row.notes||"", file: row.file_url ? { url: row.file_url, name: row.file_name } : null, matched: row.matched||false,
})
export const mapService = row => ({ id: row.id, name: row.name, price: row.price||0, vat: row.vat, companyId: row.company_id })
export const mapUser = row => ({ id: row.id, name: row.name, email: row.email, role: row.role, active: row.active })
export const mapSettings = row => ({ invoicePrefix: row.invoice_prefix, nextSeq: row.next_seq, vatRate: row.vat_rate, adminName: row.admin_name, adminEmail: row.admin_email })

export const saveInvoiceToDB = async (inv) => {
  const { error } = await supabase.from("invoices").upsert({
    id: inv.id, company_id: inv.companyId, client_name: inv.client?.name||"",
    client_email: inv.client?.email||"", client_vat: inv.client?.vat||"",
    client_address: inv.client?.address||"", client_reg: inv.client?.reg||"",
    client_type: inv.clientType||"business", date: inv.date, status: inv.status,
    payment_method: inv.paymentMethod, source: inv.source, items: inv.items,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
export const saveExpenseToDB = async (exp) => {
  const { error } = await supabase.from("expenses").upsert({
    id: exp.id, supplier: exp.supplier, date: exp.date, category: exp.category,
    net: exp.net, vat_in: exp.vatIn, payment_method: exp.paymentMethod,
    notes: exp.notes, file_url: exp.file?.url||null, file_name: exp.file?.name||null, matched: exp.matched||false,
  })
  if (error) throw error
}
export const saveCompanyToDB = async (co) => {
  const { error } = await supabase.from("companies").upsert({
    id: co.id, legal_name: co.legalName, trade_name: co.tradeName,
    website: co.website, address: co.address, vat: co.vat, email: co.email,
    phone: co.phone, reg: co.reg, color: co.color,
    bank_name: co.bank?.name||"", bank_iban: co.bank?.iban||"",
    bank_swift: co.bank?.swift||"", bank_holder: co.bank?.holder||"",
  })
  if (error) throw error
}
export const saveServiceToDB = async (s) => {
  const { error } = await supabase.from("services").upsert({ id: s.id, name: s.name, price: s.price, vat: s.vat, company_id: s.companyId })
  if (error) throw error
}
export const saveUserToDB = async (u) => {
  const { error } = await supabase.from("users").upsert({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active })
  if (error) throw error
}
export const saveSettingsToDB = async (s) => {
  const { data } = await supabase.from("settings").select("id").single()
  if (!data) return
  const { error } = await supabase.from("settings").update({
    invoice_prefix: s.invoicePrefix, next_seq: s.nextSeq, vat_rate: s.vatRate,
    admin_name: s.adminName, admin_email: s.adminEmail, updated_at: new Date().toISOString(),
  }).eq("id", data.id)
  if (error) throw error
}
export const deleteFromDB = async (table, id) => {
  const { error } = await supabase.from(table).delete().eq("id", id)
  if (error) throw error
}
export const uploadReceipt = async (file, expenseId) => {
  const ext = file.name.split('.').pop()
  const path = `receipts/${expenseId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("receipts").upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from("receipts").getPublicUrl(path)
  return { url: data.publicUrl, name: file.name }
}
