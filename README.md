# Everytask Backend

Hello :)

## Gamified Point System

This system incorporates points for difficulty, streaks, early completion, and level progression with engaging names.

**Points for Task Completion:**

- **Low Effort Low Impact (LELI):** 10 points (Simple and minimal impact tasks)
- **Low Effort High Impact (LEHI):** 20 points (Easy tasks with significant outcomes)
- **High Effort Low Impact (HELI):** 30 points (Time-consuming tasks with minimal impact)
- **High Effort High Impact (HEHI):** 50 points (Challenging tasks with significant outcomes)

**Bonus Points:**

- **Streaks:**
  - Complete 3 tasks in a row: +5 points
  - Complete 5 tasks in a row: +10 points
  - Complete 7 tasks in a row: +20 points (Streaks can be reset after a missed day)
- **Early Completion:**
  - Finish a task within 25% of estimated time: +10 points
  - Finish a task within 50% of estimated time: +5 points (Further incentivizes efficient task completion)

**Level System:**

| Level Name            | Point Requirement | Perk                                                                                                    |
| --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| Newbie                | 0 Points          | None                                                                                                    |
| Apprentice            | 100 Points        | Unlock additional customization options                                                                 |
| Procrastinator Slayer | 500 Points        | Earn double points for the next 24 hours (motivates getting tasks done)                                 |
| Master of Efficiency  | 1,000 Points      | Reduce point requirement for the next level by 10% (rewards consistent progress)                        |
| Time Lord             | 2,000 Points      | Unlock a new challenging task category (adds variety and motivates further)                             |
| Legend                | 5,000 Points      | Complete any one task and earn double points for the entire week (encourages tackling high-value tasks) |

## Badge Bonanza!

### Early Bird - Complete 3 tasks before noon.

Tabella TasksBeforeNoon con un campo `count` che tiene traccia del numero di task completati prima di mezzogiorno.

### Night Owl - Finish 2 tasks after 10 PM.

Tabella TasksAfterTenPM con un campo `count` che tiene traccia del numero di task completati dopo le 22:00.

### Taskmaster - Check off 10 tasks in a single day.

Tabella TasksToday con un campo `count` che tiene traccia del numero di task completati in un giorno.

- è da azzerare a mezzanotte?
- oppure tenere traccia di tutti i task completati in tutti i giorni? Quindi un campo `date` e un campo `count`?

### Streak Starter - Begin a 3-day task completion streak.

Quando nella tabella UserStreak c'è un record con `streak` uguale a 3.

### Persistence Pays Off - Maintain a 7-day completion streak.

Quando nella tabella UserStreak c'è un record con `streak` uguale a 7.

### Weekend Warrior - Conquer 5 tasks over the weekend.

Tabella TasksWeekend con un campo `count` che tiene traccia del numero di task completati durante il weekend.

### Power Hour - Complete 3 focused tasks within an hour.

Tabella TasksInAnHour con un campo `count` che tiene traccia del numero di task completati in un'ora.

### Small Wins Matter - Celebrate completing 3 tiny tasks (e.g., making your bed).

Tabella TinyTasks con un campo `count` che tiene traccia del numero di task completati.

### Planning Pro - Schedule future tasks for the week ahead.

Se creo un task con data settimana prossima (o successiva)

### Epic Achiever - Finish a particularly difficult or long-term task.

Tabella DifficultTasks con un campo `count` che tiene traccia del numero di task completati.

### Overcomer - Finish a task you procrastinated on for a week.

Quando finisco un task, controllare se è stato creato una settimana fa.

### Early Completion - Finish a major task significantly ahead of schedule.

Quando finisco un task, controllare se è stato completato entro il 50% del tempo stimato.

### Master Organizer - Categorize and tag 10 tasks effectively.

Tabella CategorizedTasks con un campo `count` che tiene traccia del numero di task categorizzati.

### Productivity Peak - Achieve a perfect week with 100% task completion.

- tabella TasksThisWeek con un campo `count` che tiene traccia del numero di task completati in questa settimana?
- azzerare a mezzanotte?

### Streak Superstar - Maintain a 30-day completion streak.

Quando nella tabella UserStreak c'è un record con `streak` uguale a 30.

### Level Up Legend - Reach the highest user level in the app.

Quando do ad un utente il massimo livello, gli assegno questa medaglia.

### Holiday Hustle - Finish X tasks during a specific holiday week.

Tabella TasksHoliday con un campo `count` che tiene traccia del numero di task completati durante le vacanze.

### Bug Buster - Report and help fix a bug in the app.

### Appreciation Award: Receive a special badge from the app developers.
