const express = require('express')
const db = require('../db')
const Authentication = require('../midleware/userAuth')
const Router = express.Router();
const cron = require('node-cron')
require('dotenv').config();
const jwt = require('jsonwebtoken');

//schedules

const test = () => {

}
//Daily
cron.schedule('0 12 * * *', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const getAllUsers = 'SELECT * FROM Users'
    const DailyExpenses = 'INSERT INTO DailyExpenses(Data,users_Id,Dates) VALUES(?,?,?)'
    const DailyProfit = 'INSERT INTO DailyProfit(Data,users_Id,Dates) VALUES(?,?,?)'
    const queryExpenses = 'SELECT Expenses.id, Expenses.amount  FROM Users JOIN Expenses ON Users.Users_Id = Expenses.users_Id  WHERE Users.Users_Id = ?'
    const queryProfit = 'SELECT Profit.Data FROM Users JOIN Profit ON Users.Users_Id = Profit.users_Id WHERE Users.Users_Id = ?;'
    const deleteExpenses = 'TRUNCATE TABLE Expenses'
    const deleteProfit = 'TRUNCATE TABLE Profit'

    db.query(getAllUsers, async (err, result) => {
        if (err) throw err
        const allUsers = result;

        for (user of allUsers) {
            await new Promise((resolve, reject) => {
                db.query(queryExpenses, [user.Users_Id], (err, respons) => {
                    if (err) throw reject(err);
                    let sum = 0;
                    for (data of respons) {
                        sum += Number(data.amount)
                    }
                    db.query(DailyExpenses, [sum, user.Users_Id, date], (err, response) => {
                        if (err) throw reject(err);
                        resolve()
                    })
                })
            })
            await new Promise((resolve, reject) => {
                db.query(queryProfit, [user.Users_Id], (err, respons) => {
                    if (err) throw reject(err);
                    let sum = 0;
                    respons.forEach((data) => {
                        sum += Number(data.Data)
                    })
                    db.query(DailyProfit, [sum, user.Users_Id, date], (err, response) => {
                        if (err) throw reject(err);
                        resolve()
                    })
                })
            })

        }

        db.query(deleteExpenses, (err, respons) => {
            if (err) throw err;

        })
        db.query(deleteProfit, (err, respons) => {
            if (err) throw err;

        })
    })
}, { timezone: 'UTC' })

//weekly

cron.schedule('0 12 * * 1', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const getAllUsers = 'SELECT * FROM Users'
    const DailyExpenses = 'INSERT INTO WeeklyProfit(Data,users_Id,Dates) VALUES(?,?,?)'
    const DailyProfit = 'INSERT INTO WeeklyExpenses(Data,users_Id,Dates) VALUES(?,?,?)'
    const queryExpenses = 'SELECT DailyExpenses.id, DailyExpenses.Data  FROM Users JOIN DailyExpenses ON Users.Users_Id = DailyExpenses.users_Id  WHERE Users.Users_Id = ?'
    const queryProfit = 'SELECT DailyProfit.Data FROM Users JOIN DailyProfit ON Users.Users_Id = DailyProfit.users_Id WHERE Users.Users_Id = ?;'
    const deleteExpenses = 'TRUNCATE TABLE DailyExpenses'
    const deleteProfit = 'TRUNCATE TABLE DailyProfit'

    db.query(getAllUsers, async (err, result) => {
        if (err) throw err;
        const allUsers = result;

        for (const user of allUsers) {
            // Process Expenses
            await new Promise((resolve, reject) => {
                db.query(queryExpenses, [user.Users_Id], async (err, respons) => {
                    if (err) return reject(err);
                    let sum = 0;
                    for (const data of respons) {
                        sum += Number(data.Data);
                    }
                    console.log(`Total Expenses for User ${user.Users_Id}: ${sum}`);
                    db.query(DailyExpenses, [sum, user.Users_Id, date], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });

            // Process Profit
            await new Promise((resolve, reject) => {
                db.query(queryProfit, [user.Users_Id], (err, respons) => {
                    if (err) return reject(err);
                    let sum = 0;
                    respons.forEach((data) => {
                        sum += Number(data.Data);
                    });
                    db.query(DailyProfit, [sum, user.Users_Id, date], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        }

        // Clean up
        db.query(deleteExpenses, (err) => {
            if (err) throw err;
        });
        db.query(deleteProfit, (err) => {
            if (err) throw err;         
        });

      
    });
}, { timezone: 'UTC' })

//monthly
cron.schedule('0 12 1 * *', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const getAllUsers = 'SELECT * FROM Users'
    const DailyExpenses = 'INSERT INTO MonthlyProfit(Data,users_Id,Dates) VALUES(?,?,?)'
    const DailyProfit = 'INSERT INTO MonthlyExpenses(Data,users_Id,Dates) VALUES(?,?,?)'
    const queryExpenses = 'SELECT WeeklyExpenses.id, WeeklyExpenses.Data  FROM Users JOIN WeeklyExpenses ON Users.Users_Id = WeeklyExpenses.users_Id  WHERE Users.Users_Id = ?'
    const queryProfit = 'SELECT WeeklyProfit.Data FROM Users JOIN WeeklyProfit ON Users.Users_Id = WeeklyProfit.users_Id WHERE Users.Users_Id = ?;'
    const deleteExpenses = 'TRUNCATE TABLE WeeklyExpenses'
    const deleteProfit = 'TRUNCATE TABLE WeeklyProfit'

    db.query(getAllUsers, async (err, result) => {
        if (err) throw err
        const allUsers = result;

        for (user of allUsers) {
            await new Promise((resolve, reject) => {
                db.query(queryExpenses, [user.Users_Id], (err, respons) => {
                    if (err) throw reject(err);
                    let sum = 0;

                    for (data of respons) {

                        sum += Number(data.Data)
                    }
                    console.log(`Total Expenses for User ${user.Users_Id}: ${sum}`);
                    db.query(DailyExpenses, [sum, user.Users_Id, date], (err, response) => {
                        if (err) throw reject(err);
                        resolve()
                    })
                })

            })

            await new Promise((resolve, reject) => {
                db.query(queryProfit, [user.Users_Id], (err, respons) => {
                    if (err) throw reject(err);
                    let sum = 0;
                    for (data of respons) {
                        sum += Number(data.Data)
                    }
                    db.query(DailyProfit, [sum, user.Users_Id, date], (err, response) => {
                        if (err) throw reject(err);
                        resolve();
                    })
                })
            })

        }

        db.query(deleteExpenses, (err, respons) => {
            if (err) throw err;

        })
        db.query(deleteProfit, (err, respons) => {
            if (err) throw err;

        })
    })
    console.log('inmonthly')
}, { timezone: 'UTC' })

//yerly

cron.schedule('0 12 1 1 *', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const getAllUsers = 'SELECT * FROM Users'
    const DailyExpenses = 'INSERT INTO YearlyProfit(Data,users_Id,Dates) VALUES(?,?,?)'
    const DailyProfit = 'INSERT INTO YearlyExpenses(Data,users_Id,Dates) VALUES(?,?,?)'
    const queryExpenses = 'SELECT MonthlyExpenses.id, MonthlyExpenses.Data  FROM Users JOIN MonthlyExpenses ON Users.Users_Id = MonthlyExpenses.users_Id  WHERE Users.Users_Id = ?'
    const queryProfit = 'SELECT MonthlyProfit.Data FROM Users JOIN MonthlyProfit ON Users.Users_Id = MonthlyProfit.users_Id WHERE Users.Users_Id = ?;'
    const deleteExpenses = 'TRUNCATE TABLE MonthlyExpenses'
    const deleteProfit = 'TRUNCATE TABLE MonthlyProfit'
    const deleteEpxProfit = 'UPDATE ProfVsExp SET profit=?, expenses=?'
    db.query(getAllUsers, async (err, result) => {
        if (err) throw err
        const allUsers = result;

        for (user of allUsers) {
            await new Promise((resolve, reject) => {
                db.query(queryExpenses, [user.Users_Id], (err, respons) => {
                    if (err) throw reject(err);
                    let sum = 0;
                    for (data of respons) {
                        sum += Number(data.Data)
                    }
                    db.query(DailyExpenses, [sum, user.Users_Id, date], (err, response) => {
                        if (err) throw reject(err);
                        resolve()
                    })
                })
            })
            await new Promise((resolve, reject) => {
                db.query(queryProfit, [user.Users_Id], (err, respons) => {
                    if (err) throw reject(err);
                    let sum = 0;
                    for (data of respons) {
                        sum += Number(data.Data)
                    }
                    db.query(DailyProfit, [sum, user.Users_Id, date], (err, response) => {
                        if (err) throw reject(err);
                        resolve()
                    })
                })
            })

        }

        db.query(deleteEpxProfit,[0,0], (err, respons) => {
            if (err) throw err;

        })
        db.query(deleteExpenses, (err, respons) => {
            if (err) throw err;

        })
        db.query(deleteProfit, (err, respons) => {
            if (err) throw err;

        })
    })
}, { timezone: 'UTC' })


//post apis

Router.post('/updateGoal',Authentication,(req,res)=>{
const {amount} = req.body;
const userId = req.users.id;
const insert = 'UPDATE Users SET Goal=? WHERE  users_Id=?;'

db.query(insert,[amount,userId],(err)=>{
    if(err){
        return res.status(400).json({msg:'try again'})
    }
return res.status(200).json({msg:'goal added'})
})

})
Router.post('/profExp',Authentication,(req,res)=>{
   const query = 'UPDATE ProfVsExp SET profit=?, expenses=? WHERE  users_Id=?;'
  const {profExpE,profExpP} = req.body;
   const userId = req.users.id;
   db.query(query,[profExpP,profExpE,userId],(err)=>{
   if(err){ 
  console.log(err)
}

   return res.status(200).json({msg:'added expvsprof'})
})

})
Router.post('/postBalance', Authentication, (req, res) => {
    const userId = req.users.id;
    const { balance } = req.body;
    const update = 'UPDATE Users SET Balance = ? WHERE Users_Id = ?'

    if (!balance || balance == 0) {
        return res.status(400).json({ msg: 'field required' })
    }

    db.query(update, [balance, userId], (err, respond) => {
        if (err) {
            return res.status(400).json({ msg: err })
        }
        return res.status(200).json({ msg: 'successfully updated' })
    })

})

Router.post('/expenses', Authentication, async (req, res) => {
    const userId = req.users.id;
    const { Eamount, Etype } = req.body;
    const insert = 'INSERT INTO Expenses(amount,type,users_Id) VALUES (?,?,?)';

    if (!Eamount || !Etype) {
        return res.status(400).json({ msg: 'All field required' })
    }
    db.query(insert, [Eamount, Etype, userId], (err, result) => {
        if (err) {
            return res.status(400).json({ msg: 'out of range' })
        };
        res.status(201).json({ msg: 'Expense added successfully' });
    })

})


Router.post('/Profit', Authentication, (req, res) => {
    const { profitData } = req.body;
    const userId = req.users.id;
    const insert = 'INSERT INTO Profit(Data,users_Id) VALUES (?,?)';
    if (!profitData) {
        return res.status(400).json({ msg: 'type your profit' })
    }
    db.query(insert, [profitData, userId], (err, result) => {
        if (err) {
            return res.status(400).json({ msg: 'out of range' })
        };
        res.status(201).json({ msg: 'Profit added successfully' });
    })

})


Router.post('/delExpenses', Authentication, (req, res) => {
    const userId = req.users.id;
    const { ExpensesID } = req.body;
    const del = 'DELETE FROM Expenses WHERE id = ? AND users_id = ?;'

    db.query(del, [ExpensesID, userId], (err, result) => {
        if (err) throw err;

        return res.status(200).json('successfully deleted  expenses')
    })

})

Router.post('/delProfit', Authentication, (req, res) => {
    const userId = req.users.id;
    const { ProfitID } = req.body;
    const del = 'DELETE FROM Profit WHERE Id = ? AND users_id = ?;'

    db.query(del, [ProfitID, userId], (err, result) => {
        if (err) throw err;

        return res.status(200).json('successfully deleted profit')
    })

})
//getBalance

Router.get('/getGoal',Authentication,(req,res)=>{
    const userId = req.users.id;
    const query = 'SELECT Goal FROM Users WHERE Users_Id=?'

    db.query(query,[userId],(err,respons)=>{
if (err) throw err;
return res.status(200).json(respons[0])
    })

})
Router.get('/getProfVsExp',Authentication,(req,res)=>{
   
    const query = 'SELECT profit,expenses FROM ProfVsExp WHERE users_Id=?'
    const userId = req.users.id;

    db.query(query,[userId],(err,result)=>{
        if (err) throw err;
      
        return res.status(200).json(result[0])
     })

})

Router.get('/getBalance', Authentication, (req, res) => {


    const userId = req.users.id;

    const query = 'SELECT Balance FROM Users WHERE Users_Id = ?';

    db.query(query, [userId], (err, respons) => {
        if (err) throw err;

        return res.status(200).json(respons[0])
    })
})

//getExpenses
Router.get('/getExpenses', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT Expenses.id, Expenses.amount ,Expenses.type FROM Users JOIN Expenses ON Users.Users_Id = Expenses.users_Id  WHERE Users.Users_Id = ?'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getDailyExpenses', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT DailyExpenses.id, DailyExpenses.Data ,Day(DailyExpenses.Dates) AS day FROM Users JOIN DailyExpenses ON Users.Users_Id = DailyExpenses.users_Id  WHERE Users.Users_Id = ?'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getWeeklyExpenses', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT WeeklyExpenses.id, WeeklyExpenses.Data, Day(WeeklyExpenses.Dates) AS day   FROM Users JOIN WeeklyExpenses ON Users.Users_Id = WeeklyExpenses.users_Id  WHERE Users.Users_Id = ?'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getMonthlyExpenses', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT MonthlyExpenses.id, MonthlyExpenses.Data ,MONTH(MonthlyExpenses.Dates) AS month FROM Users JOIN MonthlyExpenses ON Users.Users_Id = MonthlyExpenses.users_Id  WHERE Users.Users_Id = ?'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getYerlyExpenses', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT YearlyExpenses.id, YearlyExpenses.Data , YEAR(YearlyExpenses.Dates) AS year FROM Users JOIN YearlyExpenses ON Users.Users_Id = YearlyExpenses.users_Id  WHERE Users.Users_Id = ?'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})


//getProfit

Router.get('/getProfit', Authentication, (req, res) => {
    const userId = req.users.id;
    const query = 'SELECT Profit.Id, Profit.Data FROM Users JOIN Profit ON Users.Users_Id = Profit.users_Id WHERE Users.Users_Id = ?';


    db.query(query, [userId], (err, result) => {
        if (err) throw err;

        return res.json(result)
    })
})

Router.get('/getDailyProfit', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT DailyProfit.Data ,Day(DailyProfit.Dates) AS day FROM Users JOIN DailyProfit ON Users.Users_Id = DailyProfit.users_Id WHERE Users.Users_Id = ?;'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getWeeklyProfit', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT WeeklyProfit.Data ,Day(WeeklyProfit.Dates) AS day FROM Users JOIN WeeklyProfit ON Users.Users_Id = WeeklyProfit.users_Id WHERE Users.Users_Id = ?;'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getMonthlyProfit', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT MonthlyProfit.Data ,MONTH(MonthlyProfit.Dates) AS month FROM Users JOIN MonthlyProfit ON Users.Users_Id = MonthlyProfit.users_Id WHERE Users.Users_Id = ?;'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
Router.get('/getYerlyProfit', Authentication, async (req, res) => {
    const userId = req.users.id;
    const Dexpenses = 'SELECT YearlyProfit.Data ,YEAR(YearlyProfit.Dates) AS year FROM Users JOIN YearlyProfit ON Users.Users_Id = YearlyProfit.users_Id WHERE Users.Users_Id = ?;'
    db.query(Dexpenses, [userId], (err, respose) => {
        if (err) throw err;

        return res.json(respose)
    })
})
module.exports = Router;



