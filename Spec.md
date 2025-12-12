This file contains the spec of the project ie Career Page Builder 


-- Assumptions 
1.  The project is a career page builder where recruiters  can create and manage their career pages . 
2. Project should be scalable and should be able to handle large number of users thats why we have used relational database ie Supabse (free tier).
3. Users needs to be authenticated ,then only they can create and manage their career pages . 
4. One recruiter can create multiple career pages . 
5. Before creating career pages , recruiters need to create a company . 
5. 



-- Architecture 
1. We have taken a monolithic architecture for this project  and using nextjs for a single build , we can easily scale and build on top of it . 
2.

-- Schema 
1.  Project contains 4 main tables ie profiles , jobs,companies , company_sections . 

2. All the  tables are related to each other eg jobs is related to companies and company_sections is related to companies .

3. users are authenticated via supabase .


-- Testing
1. We can taken e2e testing for this project .
2. I have tested it on multiple device and browser .
