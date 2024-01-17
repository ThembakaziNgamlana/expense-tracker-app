export default function createExpenseDb(db) {
    async function addExpense(categoryType, amount, description) {
    
     
      try {
        const categoryId = await db.oneOrNone('SELECT * FROM category WHERE category_type = $1', [categoryType]);
  
        if (!categoryId) {
          throw new Error('Category not found');
        }
        let multiplier = {
          monthly: 1,
          weekday: 5,
          daily: 30,
        };
        let total = multiplier[categoryType] * amount
  
  
  
        await db.none(`
            INSERT INTO expense (expense, amount, total, category_id)
            VALUES ($1, $2, $3, $4)
        `, [description, parseFloat(amount), total, categoryId.id]);
  
        return { success: true, message: 'Expense added successfully' };
      } catch (error) {
        return { success: false, message: `Failed to add expense: ${error.message}` };
      }

    }
  
    async function allExpenses() {
      try {
        const expenses = await db.manyOrNone(`
            SELECT expenses.*, categories.category_type
            FROM expenses
            INNER JOIN categories ON expenses.category_id = categories.id
        `);
  
        return expenses;
      } catch (error) {
        return { success: false, message: `Failed to retrieve all expenses: ${error.message}` };
      }
    }
  
  
    async function expensesForCategory(categoryId) {
      try {
        const expenses = await db.manyOrNone(`
            SELECT expenses.*, categories.category_type
            FROM expenses
            INNER JOIN categories ON expenses.category_id = categories.id
            WHERE expenses.category_id = $1
        `, [categoryId]);
  
        return expenses;
      } catch (error) {
        return { success: false, message: `Failed to retrieve expenses for category: ${error.message}` };
      }
    }
  
    async function deleteExpense(expenseId) {
      try {
        const expense = await db.oneOrNone('SELECT * FROM expenses WHERE id = $1', [expenseId]);
  
        if (!expense) {
          throw new Error('Expense not found');
        }
  
        await db.none('DELETE FROM expenses WHERE id = $1', [expenseId]);
        return { success: true, message: 'Expense deleted successfully' };
      } catch (error) {
        return { success: false, message: `Failed to delete expense: ${error.message}` };
      }
    }
  
    async function categoryTotals() {

      try {
        
        const totals = await db.manyOrNone(`
            SELECT SUM(total) AS total_expense
            FROM expense
        `);
 // console.log(totals)
        return totals[0].total_expense;
        
      } catch (error) {
        return { success: false, message: `Failed to calculate category totals: ${error.message}` };
      }
    }
  
    return {
      
        addExpense,
        allExpenses,
        expensesForCategory,
        deleteExpense,
        categoryTotals,
      
    }
  }
  
