import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

const adapter = new FileSync('./payment.json')
const db = low(adapter)

export {
    db
}