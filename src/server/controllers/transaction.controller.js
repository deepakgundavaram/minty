import cuid from 'cuid';
import slug from 'limax';
import sanitizeHtml from 'sanitize-html';
import mongoose from 'mongoose';
import { transactionSchema } from '../models/transaction';
import writeTransactionsToDB from '../lib/writeTransactionsToDB';

const Transaction = mongoose.model('Transactions') || mongoose.model('Transactions', transactionSchema);
const MockTransaction = mongoose.model('mockTransactions') || mongoose.model('mockTransactions', transactionSchema);

export const getDailyAggregatedTransactions = (req, res) => {
  Transaction.aggregate([
    {
      $match: {
        $and: [{name:{$regex: "^((?!Interest).)*$"}},{name:{$regex: "^((?!INTERAC).)*$"}},{name:{$regex: "^((?!Credit).)*$"}},{name:{$regex: "^((?!Payment).)*$", $options: 'i'}}]
      }
    },
    { $group: {
      _id: {
        day: {
          $dayOfYear: {
            $dateFromString: {
              dateString: "$dateISO"
            }
          }
        },
        year: {
          $year: {
            $dateFromString: {
              dateString: "$dateISO"
            }
          }
        }
      },
      dailyTotal: {
        $sum: "$amount"
      }, count: {
        $sum: 1
      }
    }
  }], (err, result) => {
    if (err) res.status(500).send(err);
    res.json({ result });
  });
}

export const getDailyAggregatedMockTransactions = (req, res) => {
  MockTransaction.aggregate([
    {
      $match: {
        $and: [{name:{$regex: "^((?!Interest).)*$"}},{name:{$regex: "^((?!INTERAC).)*$"}},{name:{$regex: "^((?!Credit).)*$"}},{name:{$regex: "^((?!Payment).)*$", $options: 'i'}}]
      }
    },
    { $group: {
      _id: {
        day: {
          $dayOfYear: {
            $dateFromString: {
              dateString: "$dateISO"
            }
          }
        },
        year: {
          $year: {
            $dateFromString: {
              dateString: "$dateISO"
            }
          }
        }
      },
      dailyTotal: {
        $sum: "$amount"
      }, count: {
        $sum: 1
      }
    }
  }], (err, result) => {
    if (err) res.status(500).send(err);
    res.json({ result });
  });
}

export function getCategoryData(req, res) {
  Transaction.aggregate([{
    $group: {
      _id: {
        category: {
          $arrayElemAt: ['$category', 1]
        }
      },
      count: {
        $sum: 1
      }
    }
  }], (err, result) => {
    if (err) res.status(500).send(err);
    res.json({ result });
  });
}

export const getMockCategoryData = (req, res) => {
  MockTransaction.aggregate([{
    $group: {
      _id: {
        category: {
          $arrayElemAt: ['$category', 0]
        }
      },
      count: {
        $sum: 1
      }
    }
  }], (err, result) => {
    if (err) res.status(500).send(err);
    res.json({ result });
  });
}

/**
 * Get all transactions
 * @param req
 * @param res
 * @returns void
 */

export const filterTransactions = (query) => {
  return Transaction.find({ accountId: query.id });
}

export const getMockTransactions = (req, res) => {
  Transaction.find()
    .sort('-dateAdded')
    .exec((err, transactions) => {
      if (err) {
        res.status(500).send(err);
      }
      res.json({ transactions })
    });
}

export function getTransactions(req, res) {
  filterTransactions(req.query)
    .sort('date')
    .exec((err, transactions) => {
      if (err) {
        res.status(500).send(err);
      }
      res.json({ transactions });
    });
}

/**
 * Save a post
 * @param req
 * @param res
 * @returns void
 */
export function addTransaction(req, res) {
  if (!req.body.transaction.name || !req.body.transaction.title || !req.body.transaction.content) {
    res.status(403).end();
  }

  const newTransaction = new Transaction(req.body.transaction);

  // Let's sanitize inputs
  newTransaction.title = sanitizeHtml(newTransaction.title);
  newTransaction.name = sanitizeHtml(newTransaction.name);
  newTransaction.content = sanitizeHtml(newTransaction.content);

  newTransaction.slug = slug(newTransaction.title.toLowerCase(), { lowercase: true });
  newTransaction.cuid = cuid();
  newTransaction.save((err, saved) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ transaction: saved });
  });
}

/**
 * Get a single post
 * @param req
 * @param res
 * @returns void
 */
export function getTransaction(req, res) {
  Transaction.findOne({ cuid: req.params.cuid }).exec((err, transaction) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ transaction });
  });
}

/**
 * Delete a post
 * @param req
 * @param res
 * @returns void
 */
export function deleteTransaction(req, res) {
  Transaction.findOne({ cuid: req.params.cuid }).exec((err, transaction) => {
    if (err) {
      res.status(500).send(err);
    }

    transaction.remove(() => {
      res.status(200).end();
    });
  });
}

export const updateTransactions = async (req, res) => {
  const error = await writeTransactionsToDB(req.query);
  if (error) {
    res.status(500).send(error);
  } else {
    res.status(200).end();
  }
}
