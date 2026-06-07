DROP TABLE IF EXISTS financial_goals;
DROP TABLE IF EXISTS mutual_fund_transactions;
DROP TABLE IF EXISTS portfolio_holdings;
DROP TABLE IF EXISTS mutual_fund_nav;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS mutual_funds;
DROP TABLE IF EXISTS fund_houses;
DROP TABLE IF EXISTS wealth_clients;
DROP TABLE IF EXISTS wealth_advisors;

CREATE TABLE wealth_advisors (
    advisor_id BIGSERIAL PRIMARY KEY,
    advisor_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    region VARCHAR(50) NOT NULL,
    certification VARCHAR(80) NOT NULL,
    years_experience INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE wealth_clients (
    client_id BIGSERIAL PRIMARY KEY,
    advisor_id BIGINT NOT NULL REFERENCES wealth_advisors(advisor_id),
    client_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    city VARCHAR(80) NOT NULL,
    date_of_birth DATE NOT NULL,
    onboarding_date DATE NOT NULL,
    annual_income NUMERIC(14, 2) NOT NULL,
    net_worth NUMERIC(16, 2) NOT NULL,
    risk_profile VARCHAR(30) NOT NULL,
    investment_horizon_years INTEGER NOT NULL,
    client_status VARCHAR(30) NOT NULL
);

CREATE TABLE fund_houses (
    fund_house_id BIGSERIAL PRIMARY KEY,
    fund_house_name VARCHAR(150) UNIQUE NOT NULL,
    headquarters_city VARCHAR(80) NOT NULL,
    established_date DATE NOT NULL,
    assets_under_management NUMERIC(18, 2) NOT NULL,
    website VARCHAR(200),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE mutual_funds (
    fund_id BIGSERIAL PRIMARY KEY,
    fund_house_id BIGINT NOT NULL REFERENCES fund_houses(fund_house_id),
    scheme_code VARCHAR(40) UNIQUE NOT NULL,
    fund_name VARCHAR(180) NOT NULL,
    fund_category VARCHAR(60) NOT NULL,
    plan_type VARCHAR(30) NOT NULL,
    option_type VARCHAR(30) NOT NULL,
    benchmark VARCHAR(120) NOT NULL,
    launch_date DATE NOT NULL,
    expense_ratio NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(30) NOT NULL,
    minimum_investment NUMERIC(12, 2) NOT NULL,
    fund_status VARCHAR(30) NOT NULL
);

CREATE TABLE portfolios (
    portfolio_id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES wealth_clients(client_id),
    portfolio_name VARCHAR(120) NOT NULL,
    investment_objective VARCHAR(100) NOT NULL,
    inception_date DATE NOT NULL,
    target_equity_percent NUMERIC(5, 2) NOT NULL,
    target_debt_percent NUMERIC(5, 2) NOT NULL,
    target_hybrid_percent NUMERIC(5, 2) NOT NULL,
    portfolio_status VARCHAR(30) NOT NULL,
    UNIQUE(client_id, portfolio_name)
);

CREATE TABLE mutual_fund_nav (
    nav_id BIGSERIAL PRIMARY KEY,
    fund_id BIGINT NOT NULL REFERENCES mutual_funds(fund_id),
    nav_date DATE NOT NULL,
    nav_value NUMERIC(14, 4) NOT NULL,
    assets_under_management NUMERIC(18, 2) NOT NULL,
    one_day_return_percent NUMERIC(8, 4),
    UNIQUE(fund_id, nav_date)
);

CREATE TABLE portfolio_holdings (
    holding_id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(portfolio_id),
    fund_id BIGINT NOT NULL REFERENCES mutual_funds(fund_id),
    folio_number VARCHAR(50) NOT NULL,
    units NUMERIC(16, 4) NOT NULL,
    average_cost_nav NUMERIC(14, 4) NOT NULL,
    invested_amount NUMERIC(16, 2) NOT NULL,
    current_value NUMERIC(16, 2) NOT NULL,
    last_valuation_date DATE NOT NULL,
    UNIQUE(portfolio_id, fund_id, folio_number)
);

CREATE TABLE mutual_fund_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(portfolio_id),
    fund_id BIGINT NOT NULL REFERENCES mutual_funds(fund_id),
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    amount NUMERIC(16, 2) NOT NULL,
    units NUMERIC(16, 4) NOT NULL,
    nav_value NUMERIC(14, 4) NOT NULL,
    channel VARCHAR(40) NOT NULL,
    transaction_status VARCHAR(30) NOT NULL,
    reference_number VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE financial_goals (
    goal_id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES wealth_clients(client_id),
    linked_portfolio_id BIGINT REFERENCES portfolios(portfolio_id),
    goal_name VARCHAR(120) NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    target_date DATE NOT NULL,
    target_amount NUMERIC(16, 2) NOT NULL,
    current_amount NUMERIC(16, 2) NOT NULL,
    monthly_contribution NUMERIC(14, 2) NOT NULL,
    goal_priority VARCHAR(20) NOT NULL,
    goal_status VARCHAR(30) NOT NULL
);

INSERT INTO wealth_advisors
    (advisor_name, email, phone, region, certification, years_experience, active)
VALUES
    ('Anita Deshmukh', 'anita.deshmukh@example.com', '+91-9876501001', 'West', 'CFP', 14, TRUE),
    ('Rahul Menon', 'rahul.menon@example.com', '+91-9876501002', 'South', 'CFA', 11, TRUE),
    ('Pooja Sethi', 'pooja.sethi@example.com', '+91-9876501003', 'North', 'CFP', 9, TRUE),
    ('Arindam Bose', 'arindam.bose@example.com', '+91-9876501004', 'East', 'CWM', 12, TRUE);

INSERT INTO wealth_clients
    (advisor_id, client_name, email, city, date_of_birth, onboarding_date,
     annual_income, net_worth, risk_profile, investment_horizon_years, client_status)
VALUES
    (1, 'Aarav Shah', 'aarav.shah@example.com', 'Mumbai', '1985-04-12', '2019-06-15', 3200000, 18500000, 'aggressive', 15, 'active'),
    (2, 'Diya Nair', 'diya.nair@example.com', 'Bengaluru', '1990-09-23', '2020-02-10', 2400000, 9200000, 'moderate', 10, 'active'),
    (3, 'Kabir Malhotra', 'kabir.malhotra@example.com', 'Delhi', '1978-12-03', '2018-11-04', 4800000, 35000000, 'conservative', 7, 'active'),
    (2, 'Meera Iyer', 'meera.iyer@example.com', 'Chennai', '1994-07-19', '2022-01-20', 1800000, 5100000, 'moderate', 12, 'active'),
    (1, 'Rohan Patel', 'rohan.patel@example.com', 'Pune', '1982-01-30', '2017-08-18', 5600000, 42000000, 'aggressive', 18, 'active'),
    (4, 'Sara Khan', 'sara.khan@example.com', 'Kolkata', '1988-05-16', '2021-09-12', 2100000, 7800000, 'moderate', 9, 'active'),
    (3, 'Vikram Joshi', 'vikram.joshi@example.com', 'Jaipur', '1969-03-08', '2016-05-24', 3000000, 28000000, 'conservative', 5, 'active'),
    (4, 'Ananya Das', 'ananya.das@example.com', 'Bhubaneswar', '1996-11-27', '2023-04-03', 1250000, 2900000, 'aggressive', 20, 'active');

INSERT INTO fund_houses
    (fund_house_name, headquarters_city, established_date,
     assets_under_management, website, active)
VALUES
    ('Pinnacle Asset Management', 'Mumbai', '1998-05-12', 685000000000, 'https://pinnacle.example.com', TRUE),
    ('Sapphire Mutual Fund', 'Bengaluru', '2004-09-20', 412000000000, 'https://sapphire.example.com', TRUE),
    ('Horizon Investment Managers', 'Delhi', '1995-02-15', 530000000000, 'https://horizon.example.com', TRUE),
    ('GreenLeaf Asset Management', 'Pune', '2010-07-01', 188000000000, 'https://greenleaf.example.com', TRUE);

INSERT INTO mutual_funds
    (fund_house_id, scheme_code, fund_name, fund_category, plan_type, option_type,
     benchmark, launch_date, expense_ratio, risk_level, minimum_investment, fund_status)
VALUES
    (1, 'PIN-BLUE-001', 'Pinnacle Bluechip Equity Fund', 'Large Cap Equity', 'Direct', 'Growth', 'NIFTY 100 TRI', '2008-01-15', 0.72, 'very-high', 5000, 'active'),
    (1, 'PIN-DEBT-002', 'Pinnacle Corporate Bond Fund', 'Corporate Bond', 'Direct', 'Growth', 'CRISIL Corporate Bond Index', '2012-06-20', 0.38, 'moderate', 5000, 'active'),
    (2, 'SAP-MID-011', 'Sapphire Midcap Opportunities Fund', 'Mid Cap Equity', 'Direct', 'Growth', 'NIFTY Midcap 150 TRI', '2015-03-10', 0.84, 'very-high', 1000, 'active'),
    (2, 'SAP-LIQ-012', 'Sapphire Liquid Fund', 'Liquid', 'Direct', 'Growth', 'CRISIL Liquid Debt Index', '2009-11-02', 0.20, 'low', 1000, 'active'),
    (3, 'HOR-HYB-021', 'Horizon Balanced Advantage Fund', 'Dynamic Asset Allocation', 'Direct', 'Growth', 'CRISIL Hybrid 50+50 Index', '2011-08-18', 0.76, 'high', 5000, 'active'),
    (3, 'HOR-GILT-022', 'Horizon Government Securities Fund', 'Gilt', 'Direct', 'Growth', 'CRISIL Dynamic Gilt Index', '2003-04-25', 0.44, 'moderate', 5000, 'active'),
    (4, 'GRN-ESG-031', 'GreenLeaf ESG Leaders Fund', 'Thematic Equity', 'Direct', 'Growth', 'NIFTY 100 ESG TRI', '2020-02-14', 0.91, 'very-high', 1000, 'active'),
    (4, 'GRN-ELSS-032', 'GreenLeaf Tax Saver Fund', 'ELSS', 'Direct', 'Growth', 'NIFTY 500 TRI', '2016-12-01', 0.79, 'very-high', 500, 'active');

INSERT INTO portfolios
    (client_id, portfolio_name, investment_objective, inception_date,
     target_equity_percent, target_debt_percent, target_hybrid_percent, portfolio_status)
VALUES
    (1, 'Long Term Growth', 'wealth-creation', '2019-06-20', 75, 15, 10, 'active'),
    (2, 'Balanced Future', 'balanced-growth', '2020-02-15', 50, 30, 20, 'active'),
    (3, 'Capital Preservation', 'capital-preservation', '2018-11-10', 20, 70, 10, 'active'),
    (4, 'Early Retirement', 'retirement', '2022-01-25', 65, 20, 15, 'active'),
    (5, 'Family Wealth', 'wealth-creation', '2017-08-25', 80, 10, 10, 'active'),
    (6, 'Education and Growth', 'education', '2021-09-18', 55, 25, 20, 'active'),
    (7, 'Retirement Income', 'income-generation', '2016-06-01', 15, 75, 10, 'active'),
    (8, 'First Million', 'wealth-creation', '2023-04-10', 85, 5, 10, 'active');

INSERT INTO mutual_fund_nav
    (fund_id, nav_date, nav_value, assets_under_management, one_day_return_percent)
VALUES
    (1, '2026-06-05', 186.4521, 98500000000, 0.4210),
    (1, '2026-06-06', 187.1184, 99000000000, 0.3574),
    (2, '2026-06-05', 42.7612, 71000000000, 0.0412),
    (2, '2026-06-06', 42.7895, 71200000000, 0.0662),
    (3, '2026-06-05', 94.3382, 64200000000, -0.2840),
    (3, '2026-06-06', 95.0248, 64800000000, 0.7278),
    (4, '2026-06-05', 38.9024, 53000000000, 0.0154),
    (4, '2026-06-06', 38.9141, 53200000000, 0.0301),
    (5, '2026-06-05', 71.6840, 87000000000, 0.1882),
    (5, '2026-06-06', 71.9525, 87400000000, 0.3746),
    (6, '2026-06-05', 35.4280, 59000000000, -0.0180),
    (6, '2026-06-06', 35.4612, 59100000000, 0.0937),
    (7, '2026-06-05', 28.7640, 34200000000, 0.5120),
    (7, '2026-06-06', 28.9186, 34600000000, 0.5375),
    (8, '2026-06-05', 56.1423, 40100000000, 0.3100),
    (8, '2026-06-06', 56.3897, 40500000000, 0.4407);

INSERT INTO portfolio_holdings
    (portfolio_id, fund_id, folio_number, units, average_cost_nav,
     invested_amount, current_value, last_valuation_date)
VALUES
    (1, 1, 'PIN100001', 18500.0000, 142.0000, 2627000, 3461690.40, '2026-06-06'),
    (1, 3, 'SAP100002', 9200.0000, 78.5000, 722200, 874228.16, '2026-06-06'),
    (1, 2, 'PIN100003', 18000.0000, 38.2000, 687600, 770211.00, '2026-06-06'),
    (2, 5, 'HOR200001', 12400.0000, 62.1000, 770040, 892211.00, '2026-06-06'),
    (2, 2, 'PIN200002', 15000.0000, 39.5000, 592500, 641842.50, '2026-06-06'),
    (3, 6, 'HOR300001', 42000.0000, 31.8000, 1335600, 1489370.40, '2026-06-06'),
    (3, 4, 'SAP300002', 30000.0000, 36.2500, 1087500, 1167423.00, '2026-06-06'),
    (4, 1, 'PIN400001', 5200.0000, 165.0000, 858000, 973015.68, '2026-06-06'),
    (4, 5, 'HOR400002', 6800.0000, 66.5000, 452200, 489277.00, '2026-06-06'),
    (5, 1, 'PIN500001', 35000.0000, 118.0000, 4130000, 6549144.00, '2026-06-06'),
    (5, 7, 'GRN500002', 24000.0000, 22.4000, 537600, 694046.40, '2026-06-06'),
    (6, 3, 'SAP600001', 7100.0000, 82.0000, 582200, 674676.08, '2026-06-06'),
    (6, 5, 'HOR600002', 5400.0000, 68.2000, 368280, 388543.50, '2026-06-06'),
    (7, 6, 'HOR700001', 60000.0000, 29.7500, 1785000, 2127672.00, '2026-06-06'),
    (7, 4, 'SAP700002', 45000.0000, 34.1000, 1534500, 1751134.50, '2026-06-06'),
    (8, 7, 'GRN800001', 3400.0000, 25.5000, 86700, 98323.24, '2026-06-06'),
    (8, 8, 'GRN800002', 1900.0000, 51.0000, 96900, 107140.43, '2026-06-06');

INSERT INTO mutual_fund_transactions
    (portfolio_id, fund_id, transaction_date, transaction_type, amount,
     units, nav_value, channel, transaction_status, reference_number)
VALUES
    (1, 1, '2026-05-05', 'SIP', 50000, 270.1659, 185.0714, 'auto-debit', 'completed', 'TXN-20260505-001'),
    (1, 3, '2026-05-12', 'purchase', 100000, 1068.8324, 93.5599, 'net-banking', 'completed', 'TXN-20260512-002'),
    (2, 5, '2026-05-10', 'SIP', 30000, 420.5102, 71.3421, 'auto-debit', 'completed', 'TXN-20260510-003'),
    (2, 2, '2026-05-18', 'purchase', 75000, 1756.0281, 42.7100, 'upi', 'completed', 'TXN-20260518-004'),
    (3, 6, '2026-05-07', 'SIP', 40000, 1131.5417, 35.3499, 'auto-debit', 'completed', 'TXN-20260507-005'),
    (3, 4, '2026-05-21', 'redemption', 50000, 1287.0013, 38.8499, 'advisor', 'completed', 'TXN-20260521-006'),
    (4, 1, '2026-05-03', 'SIP', 25000, 135.6745, 184.2646, 'auto-debit', 'completed', 'TXN-20260503-007'),
    (5, 7, '2026-05-16', 'purchase', 200000, 7015.7087, 28.5075, 'advisor', 'completed', 'TXN-20260516-008'),
    (6, 3, '2026-05-11', 'SIP', 20000, 212.8593, 93.9588, 'auto-debit', 'completed', 'TXN-20260511-009'),
    (7, 6, '2026-05-09', 'SWP', 35000, 986.5308, 35.4779, 'auto-credit', 'completed', 'TXN-20260509-010'),
    (8, 8, '2026-05-14', 'SIP', 10000, 178.9011, 55.8968, 'upi', 'completed', 'TXN-20260514-011'),
    (8, 7, '2026-05-28', 'purchase', 25000, 867.0250, 28.8343, 'net-banking', 'completed', 'TXN-20260528-012');

INSERT INTO financial_goals
    (client_id, linked_portfolio_id, goal_name, goal_type, target_date,
     target_amount, current_amount, monthly_contribution, goal_priority, goal_status)
VALUES
    (1, 1, 'Retirement Corpus', 'retirement', '2045-03-31', 75000000, 5100000, 100000, 'high', 'on-track'),
    (2, 2, 'Child Higher Education', 'education', '2038-06-30', 15000000, 1800000, 45000, 'high', 'on-track'),
    (3, 3, 'Capital Preservation', 'retirement', '2033-12-31', 40000000, 12500000, 80000, 'high', 'on-track'),
    (4, 4, 'Early Retirement', 'retirement', '2042-03-31', 50000000, 1700000, 65000, 'high', 'attention-needed'),
    (5, 5, 'Family Legacy Fund', 'legacy', '2050-12-31', 120000000, 18000000, 150000, 'medium', 'on-track'),
    (6, 6, 'International Education', 'education', '2035-05-31', 12000000, 1400000, 35000, 'high', 'on-track'),
    (7, 7, 'Monthly Retirement Income', 'income', '2030-03-31', 30000000, 15500000, 50000, 'high', 'on-track'),
    (8, 8, 'First Home Down Payment', 'home-purchase', '2032-12-31', 5000000, 350000, 30000, 'high', 'on-track');
