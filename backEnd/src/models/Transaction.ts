import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type TransactionType = "Income" | "Expense";

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ITransaction {
  userId: Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  type: TransactionType;
  validateAmount(amount: number): boolean;
  addTransaction(): Promise<TransactionDocument>;
  editTransaction(updates: Partial<ITransaction>): Promise<TransactionDocument>;
}

export type TransactionDocument = HydratedDocument<ITransaction>;

interface TransactionQuery {
  userId: string | Types.ObjectId;
  type?: TransactionType;
  category?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

interface TransactionModel extends Model<ITransaction> {
  fetchTransactions(
    userId: string | Types.ObjectId,
    filters?: TransactionFilters,
  ): Promise<TransactionDocument[]>;
}

const transactionSchema = new Schema<ITransaction, TransactionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserId is required"],
    },
    amount: {
      type: Number,
      required: [true, "Please enter an amount."],
      min: [0.01, "amount must me greater than 0"],
      max: [9999999.99, "Amount cannot exceed 9999999.99"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ["Income", "Expense"],
        message: "Transaction type must be Income or Expense",
      },
    },
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  },
);

transactionSchema.methods.validateAmount = function (amount: number): boolean {
  return typeof amount === "number" && amount > 0 && amount <= 9999999.99;
};

transactionSchema.methods.addTransaction =
  async function (): Promise<TransactionDocument> {
    return await this.save();
  };

transactionSchema.methods.editTransaction = async function (
  updates: Partial<ITransaction>,
): Promise<TransactionDocument> {
  Object.assign(this, updates);
  return await this.save();
};

transactionSchema.statics.fetchTransactions = async function (
  userId: string,
  filters: TransactionFilters = {},
): Promise<TransactionDocument[]> {
  const query: any = {
    userId,
  };

  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.categoryId) {
    query.category = filters.categoryId;
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  return await this.find(query)
    .populate("category", "name type")
    .sort({ date: -1 });
};

const Transaction = mongoose.model<ITransaction, TransactionModel>(
  "Transaction",
  transactionSchema,
);
export default Transaction;
