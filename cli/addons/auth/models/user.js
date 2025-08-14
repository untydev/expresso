import { Model } from '@untydev/expresso'

export default {
  id: {
    type: Model.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  email: {
    type: Model.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Model.STRING,
    allowNull: false
  },
  isActive: {
    type: Model.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  activationCode: {
    type: Model.STRING
  },
  passwordResetCode: {
    type: Model.STRING
  }
}
