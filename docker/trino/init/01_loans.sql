CREATE SCHEMA iceberg.lending
WITH (location = 's3://wren-iceberg/lending/');

CREATE TABLE iceberg.lending.borrowers
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['state']
) AS
SELECT
    CAST(borrower_id AS BIGINT) AS borrower_id,
    CAST(full_name AS VARCHAR) AS full_name,
    CAST(date_of_birth AS DATE) AS date_of_birth,
    CAST(city AS VARCHAR) AS city,
    CAST(state AS VARCHAR) AS state,
    CAST(employment_type AS VARCHAR) AS employment_type,
    CAST(annual_income AS DECIMAL(14, 2)) AS annual_income,
    CAST(credit_score AS INTEGER) AS credit_score,
    CAST(customer_since AS DATE) AS customer_since
FROM (
    VALUES
    (1001, 'Aarav Mehta', DATE '1988-03-14', 'Mumbai', 'Maharashtra', 'salaried', DECIMAL '1450000.00', 782, DATE '2018-06-12'),
    (1002, 'Diya Nair', DATE '1991-11-08', 'Bengaluru', 'Karnataka', 'self-employed', DECIMAL '2100000.00', 748, DATE '2019-02-25'),
    (1003, 'Kabir Singh', DATE '1985-07-21', 'Delhi', 'Delhi', 'salaried', DECIMAL '1850000.00', 721, DATE '2017-09-04'),
    (1004, 'Meera Iyer', DATE '1993-01-30', 'Chennai', 'Tamil Nadu', 'salaried', DECIMAL '1200000.00', 806, DATE '2021-01-18'),
    (1005, 'Rohan Patel', DATE '1979-05-12', 'Ahmedabad', 'Gujarat', 'business-owner', DECIMAL '3200000.00', 694, DATE '2016-04-07'),
    (1006, 'Ananya Rao', DATE '1995-09-17', 'Hyderabad', 'Telangana', 'salaried', DECIMAL '980000.00', 765, DATE '2022-03-11'),
    (1007, 'Vikram Joshi', DATE '1982-12-03', 'Pune', 'Maharashtra', 'self-employed', DECIMAL '2400000.00', 676, DATE '2018-11-29'),
    (1008, 'Sara Khan', DATE '1990-04-26', 'Lucknow', 'Uttar Pradesh', 'salaried', DECIMAL '1100000.00', 739, DATE '2020-08-15'),
    (1009, 'Neel Das', DATE '1987-08-19', 'Kolkata', 'West Bengal', 'salaried', DECIMAL '1550000.00', 713, DATE '2019-12-02'),
    (1010, 'Ishita Verma', DATE '1996-06-09', 'Jaipur', 'Rajasthan', 'contractor', DECIMAL '850000.00', 688, DATE '2023-05-20')
) AS t(borrower_id, full_name, date_of_birth, city, state, employment_type, annual_income, credit_score, customer_since);

CREATE TABLE iceberg.lending.loan_providers
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['provider_type']
) AS
SELECT
    CAST(provider_id AS BIGINT) AS provider_id,
    CAST(provider_name AS VARCHAR) AS provider_name,
    CAST(provider_type AS VARCHAR) AS provider_type,
    CAST(registration_number AS VARCHAR) AS registration_number,
    CAST(headquarters_city AS VARCHAR) AS headquarters_city,
    CAST(headquarters_state AS VARCHAR) AS headquarters_state,
    CAST(established_date AS DATE) AS established_date,
    CAST(risk_rating AS VARCHAR) AS risk_rating,
    CAST(active AS BOOLEAN) AS active
FROM (
    VALUES
    (2001, 'Bharat National Bank', 'public-bank', 'RBI-BNB-001', 'Mumbai', 'Maharashtra', DATE '1955-07-01', 'low', true),
    (2002, 'Meridian Private Bank', 'private-bank', 'RBI-MPB-014', 'Bengaluru', 'Karnataka', DATE '1994-03-18', 'low', true),
    (2003, 'Pragati Finance Limited', 'nbfc', 'RBI-NBFC-228', 'Delhi', 'Delhi', DATE '2006-09-12', 'medium', true),
    (2004, 'Sahyog Housing Finance', 'housing-finance', 'NHB-SHF-091', 'Pune', 'Maharashtra', DATE '2001-01-25', 'low', true),
    (2005, 'Udaan Digital Credit', 'fintech', 'RBI-DLA-317', 'Hyderabad', 'Telangana', DATE '2018-11-08', 'medium', true)
) AS t(provider_id, provider_name, provider_type, registration_number, headquarters_city, headquarters_state, established_date, risk_rating, active);

CREATE TABLE iceberg.lending.provider_branches
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['state']
) AS
SELECT
    CAST(branch_code AS VARCHAR) AS branch_code,
    CAST(provider_id AS BIGINT) AS provider_id,
    CAST(branch_name AS VARCHAR) AS branch_name,
    CAST(city AS VARCHAR) AS city,
    CAST(state AS VARCHAR) AS state,
    CAST(opened_date AS DATE) AS opened_date,
    CAST(branch_manager AS VARCHAR) AS branch_manager,
    CAST(servicing_region AS VARCHAR) AS servicing_region,
    CAST(active AS BOOLEAN) AS active
FROM (
    VALUES
    ('MUM-01', 2001, 'Mumbai Central', 'Mumbai', 'Maharashtra', DATE '1984-06-01', 'Nitin Kulkarni', 'west', true),
    ('BLR-03', 2002, 'Indiranagar', 'Bengaluru', 'Karnataka', DATE '2002-09-15', 'Lakshmi Menon', 'south', true),
    ('DEL-02', 2001, 'Connaught Place', 'Delhi', 'Delhi', DATE '1978-04-10', 'Rajeev Sethi', 'north', true),
    ('CHE-01', 2005, 'T Nagar Digital Hub', 'Chennai', 'Tamil Nadu', DATE '2020-01-20', 'Divya Krishnan', 'south', true),
    ('AMD-01', 2003, 'Ashram Road', 'Ahmedabad', 'Gujarat', DATE '2010-08-12', 'Bhavesh Shah', 'west', true),
    ('HYD-04', 2005, 'Hitech City', 'Hyderabad', 'Telangana', DATE '2019-05-14', 'Srinivas Reddy', 'south', true),
    ('PUN-02', 2004, 'Shivajinagar', 'Pune', 'Maharashtra', DATE '2005-02-07', 'Madhuri Deshpande', 'west', true),
    ('LKO-01', 2003, 'Hazratganj', 'Lucknow', 'Uttar Pradesh', DATE '2012-10-22', 'Amit Tandon', 'north', true),
    ('KOL-03', 2002, 'Salt Lake', 'Kolkata', 'West Bengal', DATE '2008-07-19', 'Arindam Bose', 'east', true),
    ('JAI-01', 2005, 'C Scheme', 'Jaipur', 'Rajasthan', DATE '2021-03-05', 'Kavita Sharma', 'north', true)
) AS t(branch_code, provider_id, branch_name, city, state, opened_date, branch_manager, servicing_region, active);

CREATE TABLE iceberg.lending.loan_products
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['loan_type']
) AS
SELECT
    CAST(product_id AS BIGINT) AS product_id,
    CAST(provider_id AS BIGINT) AS provider_id,
    CAST(product_name AS VARCHAR) AS product_name,
    CAST(loan_type AS VARCHAR) AS loan_type,
    CAST(minimum_amount AS DECIMAL(14, 2)) AS minimum_amount,
    CAST(maximum_amount AS DECIMAL(14, 2)) AS maximum_amount,
    CAST(minimum_interest_rate AS DECIMAL(5, 2)) AS minimum_interest_rate,
    CAST(maximum_interest_rate AS DECIMAL(5, 2)) AS maximum_interest_rate,
    CAST(minimum_tenure_months AS INTEGER) AS minimum_tenure_months,
    CAST(maximum_tenure_months AS INTEGER) AS maximum_tenure_months,
    CAST(secured AS BOOLEAN) AS secured,
    CAST(active AS BOOLEAN) AS active
FROM (
    VALUES
    (3001, 2001, 'BNB Home Advantage', 'home', DECIMAL '1000000.00', DECIMAL '25000000.00', DECIMAL '8.10', DECIMAL '9.25', 60, 360, true, true),
    (3002, 2001, 'BNB Auto Drive', 'vehicle', DECIMAL '200000.00', DECIMAL '3000000.00', DECIMAL '8.50', DECIMAL '10.25', 12, 84, true, true),
    (3003, 2002, 'Meridian Business Growth', 'business', DECIMAL '500000.00', DECIMAL '10000000.00', DECIMAL '10.50', DECIMAL '13.50', 12, 120, false, true),
    (3004, 2002, 'Meridian Wheels', 'vehicle', DECIMAL '300000.00', DECIMAL '5000000.00', DECIMAL '8.60', DECIMAL '10.00', 12, 84, true, true),
    (3005, 2003, 'Pragati MSME Plus', 'business', DECIMAL '300000.00', DECIMAL '7500000.00', DECIMAL '10.25', DECIMAL '15.00', 12, 96, false, true),
    (3006, 2003, 'Pragati Personal Flex', 'personal', DECIMAL '50000.00', DECIMAL '1000000.00', DECIMAL '12.00', DECIMAL '18.00', 6, 48, false, true),
    (3007, 2004, 'Sahyog Home Secure', 'home', DECIMAL '1000000.00', DECIMAL '20000000.00', DECIMAL '8.35', DECIMAL '10.00', 60, 300, true, true),
    (3008, 2005, 'Udaan Instant Personal', 'personal', DECIMAL '25000.00', DECIMAL '750000.00', DECIMAL '12.25', DECIMAL '20.00', 3, 36, false, true),
    (3009, 2005, 'Udaan Study Advance', 'education', DECIMAL '100000.00', DECIMAL '2000000.00', DECIMAL '8.90', DECIMAL '12.50', 12, 120, false, true)
) AS t(product_id, provider_id, product_name, loan_type, minimum_amount, maximum_amount, minimum_interest_rate, maximum_interest_rate, minimum_tenure_months, maximum_tenure_months, secured, active);

CREATE TABLE iceberg.lending.loans
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['status']
) AS
SELECT
    CAST(loan_id AS BIGINT) AS loan_id,
    CAST(borrower_id AS BIGINT) AS borrower_id,
    CAST(loan_type AS VARCHAR) AS loan_type,
    CAST(application_date AS DATE) AS application_date,
    CAST(disbursement_date AS DATE) AS disbursement_date,
    CAST(principal_amount AS DECIMAL(14, 2)) AS principal_amount,
    CAST(interest_rate AS DECIMAL(5, 2)) AS interest_rate,
    CAST(tenure_months AS INTEGER) AS tenure_months,
    CAST(monthly_installment AS DECIMAL(14, 2)) AS monthly_installment,
    CAST(status AS VARCHAR) AS status,
    CAST(branch_code AS VARCHAR) AS branch_code
FROM (
    VALUES
    (50001, 1001, 'home', DATE '2022-01-10', DATE '2022-02-01', DECIMAL '6500000.00', DECIMAL '8.35', 240, DECIMAL '55791.00', 'active', 'MUM-01'),
    (50002, 1002, 'business', DATE '2023-03-04', DATE '2023-03-20', DECIMAL '2500000.00', DECIMAL '11.25', 60, DECIMAL '54674.00', 'active', 'BLR-03'),
    (50003, 1003, 'vehicle', DATE '2021-08-14', DATE '2021-08-25', DECIMAL '1200000.00', DECIMAL '9.10', 60, DECIMAL '24961.00', 'closed', 'DEL-02'),
    (50004, 1004, 'personal', DATE '2024-02-02', DATE '2024-02-08', DECIMAL '500000.00', DECIMAL '12.40', 36, DECIMAL '16704.00', 'active', 'CHE-01'),
    (50005, 1005, 'business', DATE '2020-06-19', DATE '2020-07-01', DECIMAL '4000000.00', DECIMAL '10.75', 84, DECIMAL '68086.00', 'active', 'AMD-01'),
    (50006, 1006, 'education', DATE '2023-07-12', DATE '2023-08-01', DECIMAL '900000.00', DECIMAL '9.50', 72, DECIMAL '16445.00', 'active', 'HYD-04'),
    (50007, 1007, 'home', DATE '2019-11-08', DATE '2019-12-02', DECIMAL '4800000.00', DECIMAL '8.90', 180, DECIMAL '48391.00', 'delinquent', 'PUN-02'),
    (50008, 1008, 'personal', DATE '2022-09-21', DATE '2022-09-27', DECIMAL '350000.00', DECIMAL '13.10', 24, DECIMAL '16676.00', 'closed', 'LKO-01'),
    (50009, 1009, 'vehicle', DATE '2024-01-15', DATE '2024-01-29', DECIMAL '1500000.00', DECIMAL '9.25', 72, DECIMAL '27228.00', 'active', 'KOL-03'),
    (50010, 1010, 'personal', DATE '2024-05-03', DATE '2024-05-10', DECIMAL '300000.00', DECIMAL '14.20', 24, DECIMAL '14437.00', 'delinquent', 'JAI-01'),
    (50011, 1001, 'vehicle', DATE '2023-10-11', DATE '2023-10-19', DECIMAL '1800000.00', DECIMAL '8.85', 60, DECIMAL '37237.00', 'active', 'MUM-01'),
    (50012, 1004, 'education', DATE '2020-04-17', DATE '2020-05-05', DECIMAL '700000.00', DECIMAL '9.20', 60, DECIMAL '14604.00', 'closed', 'CHE-01')
) AS t(loan_id, borrower_id, loan_type, application_date, disbursement_date, principal_amount, interest_rate, tenure_months, monthly_installment, status, branch_code);

CREATE TABLE iceberg.lending.loan_provider_assignments
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['provider_id']
) AS
SELECT
    CAST(assignment_id AS BIGINT) AS assignment_id,
    CAST(loan_id AS BIGINT) AS loan_id,
    CAST(provider_id AS BIGINT) AS provider_id,
    CAST(product_id AS BIGINT) AS product_id,
    CAST(branch_code AS VARCHAR) AS branch_code,
    CAST(origination_channel AS VARCHAR) AS origination_channel,
    CAST(servicing_status AS VARCHAR) AS servicing_status,
    CAST(assigned_date AS DATE) AS assigned_date,
    CAST(relationship_manager AS VARCHAR) AS relationship_manager
FROM (
    VALUES
    (70001, 50001, 2001, 3001, 'MUM-01', 'branch', 'in-house', DATE '2022-01-10', 'Nisha Arora'),
    (70002, 50002, 2002, 3003, 'BLR-03', 'relationship-manager', 'in-house', DATE '2023-03-04', 'Harish Gowda'),
    (70003, 50003, 2001, 3002, 'DEL-02', 'dealer', 'closed', DATE '2021-08-14', 'Pooja Batra'),
    (70004, 50004, 2005, 3008, 'CHE-01', 'mobile-app', 'digital', DATE '2024-02-02', 'Karthik Ravi'),
    (70005, 50005, 2003, 3005, 'AMD-01', 'branch', 'in-house', DATE '2020-06-19', 'Jignesh Mehta'),
    (70006, 50006, 2005, 3009, 'HYD-04', 'web', 'digital', DATE '2023-07-12', 'Sneha Rao'),
    (70007, 50007, 2004, 3007, 'PUN-02', 'branch', 'collections-watch', DATE '2019-11-08', 'Ritesh Patil'),
    (70008, 50008, 2003, 3006, 'LKO-01', 'branch', 'closed', DATE '2022-09-21', 'Shalini Kapoor'),
    (70009, 50009, 2002, 3004, 'KOL-03', 'dealer', 'in-house', DATE '2024-01-15', 'Subhajit Roy'),
    (70010, 50010, 2005, 3008, 'JAI-01', 'mobile-app', 'collections-watch', DATE '2024-05-03', 'Renu Mathur'),
    (70011, 50011, 2001, 3002, 'MUM-01', 'dealer', 'in-house', DATE '2023-10-11', 'Nisha Arora'),
    (70012, 50012, 2005, 3009, 'CHE-01', 'web', 'closed', DATE '2020-04-17', 'Karthik Ravi')
) AS t(assignment_id, loan_id, provider_id, product_id, branch_code, origination_channel, servicing_status, assigned_date, relationship_manager);

CREATE TABLE iceberg.lending.repayments
WITH (
    format = 'PARQUET',
    partitioning = ARRAY['month(due_date)']
) AS
SELECT
    CAST(repayment_id AS BIGINT) AS repayment_id,
    CAST(loan_id AS BIGINT) AS loan_id,
    CAST(due_date AS DATE) AS due_date,
    CAST(payment_date AS DATE) AS payment_date,
    CAST(principal_component AS DECIMAL(14, 2)) AS principal_component,
    CAST(interest_component AS DECIMAL(14, 2)) AS interest_component,
    CAST(late_fee AS DECIMAL(12, 2)) AS late_fee,
    CAST(amount_paid AS DECIMAL(14, 2)) AS amount_paid,
    CAST(payment_status AS VARCHAR) AS payment_status,
    CAST(payment_channel AS VARCHAR) AS payment_channel
FROM (
    VALUES
    (90001, 50001, DATE '2024-01-01', DATE '2024-01-01', DECIMAL '11104.00', DECIMAL '44687.00', DECIMAL '0.00', DECIMAL '55791.00', 'paid', 'auto-debit'),
    (90002, 50001, DATE '2024-02-01', DATE '2024-02-01', DECIMAL '11181.00', DECIMAL '44610.00', DECIMAL '0.00', DECIMAL '55791.00', 'paid', 'auto-debit'),
    (90003, 50002, DATE '2024-01-20', DATE '2024-01-20', DECIMAL '31411.00', DECIMAL '23263.00', DECIMAL '0.00', DECIMAL '54674.00', 'paid', 'net-banking'),
    (90004, 50002, DATE '2024-02-20', DATE '2024-02-22', DECIMAL '31705.00', DECIMAL '22969.00', DECIMAL '500.00', DECIMAL '55174.00', 'paid-late', 'net-banking'),
    (90005, 50004, DATE '2024-03-08', DATE '2024-03-08', DECIMAL '11537.00', DECIMAL '5167.00', DECIMAL '0.00', DECIMAL '16704.00', 'paid', 'upi'),
    (90006, 50004, DATE '2024-04-08', DATE '2024-04-08', DECIMAL '11656.00', DECIMAL '5048.00', DECIMAL '0.00', DECIMAL '16704.00', 'paid', 'upi'),
    (90007, 50005, DATE '2024-01-01', DATE '2024-01-01', DECIMAL '38253.00', DECIMAL '29833.00', DECIMAL '0.00', DECIMAL '68086.00', 'paid', 'auto-debit'),
    (90008, 50005, DATE '2024-02-01', DATE '2024-02-01', DECIMAL '38596.00', DECIMAL '29490.00', DECIMAL '0.00', DECIMAL '68086.00', 'paid', 'auto-debit'),
    (90009, 50006, DATE '2024-01-01', DATE '2024-01-03', DECIMAL '9320.00', DECIMAL '7125.00', DECIMAL '250.00', DECIMAL '16695.00', 'paid-late', 'upi'),
    (90010, 50006, DATE '2024-02-01', DATE '2024-02-01', DECIMAL '9394.00', DECIMAL '7051.00', DECIMAL '0.00', DECIMAL '16445.00', 'paid', 'upi'),
    (90011, 50007, DATE '2024-01-02', DATE '2024-01-18', DECIMAL '14112.00', DECIMAL '34279.00', DECIMAL '1800.00', DECIMAL '50191.00', 'paid-late', 'cash'),
    (90012, 50007, DATE '2024-02-02', NULL, DECIMAL '14217.00', DECIMAL '34174.00', DECIMAL '2400.00', DECIMAL '0.00', 'overdue', 'pending'),
    (90013, 50009, DATE '2024-02-29', DATE '2024-02-29', DECIMAL '15666.00', DECIMAL '11562.00', DECIMAL '0.00', DECIMAL '27228.00', 'paid', 'auto-debit'),
    (90014, 50009, DATE '2024-03-29', DATE '2024-03-29', DECIMAL '15787.00', DECIMAL '11441.00', DECIMAL '0.00', DECIMAL '27228.00', 'paid', 'auto-debit'),
    (90015, 50010, DATE '2024-06-10', DATE '2024-06-17', DECIMAL '10887.00', DECIMAL '3550.00', DECIMAL '900.00', DECIMAL '15337.00', 'paid-late', 'cash'),
    (90016, 50010, DATE '2024-07-10', NULL, DECIMAL '11016.00', DECIMAL '3421.00', DECIMAL '1200.00', DECIMAL '0.00', 'overdue', 'pending'),
    (90017, 50011, DATE '2024-01-19', DATE '2024-01-19', DECIMAL '23962.00', DECIMAL '13275.00', DECIMAL '0.00', DECIMAL '37237.00', 'paid', 'net-banking'),
    (90018, 50011, DATE '2024-02-19', DATE '2024-02-19', DECIMAL '24139.00', DECIMAL '13098.00', DECIMAL '0.00', DECIMAL '37237.00', 'paid', 'net-banking')
) AS t(repayment_id, loan_id, due_date, payment_date, principal_component, interest_component, late_fee, amount_paid, payment_status, payment_channel);
