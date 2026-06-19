"use strict";(()=>{var e={};e.id=702,e.ids=[702],e.modules={6352:e=>{e.exports=require("apollo-server-micro")},8432:e=>{e.exports=require("bcryptjs")},2754:e=>{e.exports=require("cron-parser")},7343:e=>{e.exports=require("graphql")},6762:e=>{e.exports=require("graphql-type-json")},514:e=>{e.exports=require("knex")},6897:e=>{e.exports=require("lodash/camelCase")},9969:e=>{e.exports=require("lodash/capitalize")},221:e=>{e.exports=require("lodash/chunk")},9699:e=>{e.exports=require("lodash/isEmpty")},6069:e=>{e.exports=require("lodash/isNil")},5452:e=>{e.exports=require("lodash/isPlainObject")},7413:e=>{e.exports=require("lodash/mapKeys")},9941:e=>{e.exports=require("lodash/mapValues")},4159:e=>{e.exports=require("lodash/pick")},808:e=>{e.exports=require("lodash/pickBy")},9822:e=>{e.exports=require("lodash/reduce")},1131:e=>{e.exports=require("lodash/snakeCase")},8094:e=>{e.exports=require("log4js")},2799:e=>{e.exports=require("micro-cors")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},9794:e=>{e.exports=require("posthog-node")},752:e=>{e.exports=require("tslib")},4770:e=>{e.exports=require("crypto")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},9648:e=>{e.exports=import("axios")},1274:e=>{e.exports=import("sql-formatter")},6555:e=>{e.exports=import("uuid")},6005:e=>{e.exports=require("node:crypto")},4813:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>m,default:()=>l,routeModule:()=>p});var i=a(1802),n=a(7153),o=a(6249),s=a(5675),d=e([s]);s=(d.then?(await d)():d)[0];let l=(0,o.l)(s,"default"),m=(0,o.l)(s,"config"),p=new i.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/graphql",pathname:"/api/graphql",bundlePath:"",filename:""},userland:s});r()}catch(e){r(e)}})},3050:(e,t,a)=>{a.d(t,{Y0:()=>r,uC:()=>o,H4:()=>s,cC:()=>d,n5:()=>n});var r,i=a(3547);!function(e){e.MUSIC="MUSIC",e.NBA="NBA",e.ECOMMERCE="ECOMMERCE",e.HR="HR"}(r||(r={}));let n={hr:{name:r.HR,tables:[{tableName:"salaries",filePath:"https://assets.getwren.ai/sample_data/employees/salaries.parquet",schema:[{columnName:"emp_no",dataType:"INTEGER"},{columnName:"salary",dataType:"INTEGER"},{columnName:"from_date",dataType:"DATE"},{columnName:"to_date",dataType:"DATE"}],columns:[{name:"emp_no",properties:{description:"The employee number",displayName:"emp_no"}},{name:"salary",properties:{description:"The salary of the employee.",displayName:"salary"}},{name:"from_date",properties:{description:"The start date of the salary period.",displayName:"from_date"}},{name:"to_date",properties:{description:"The end date of the salary period.",displayName:"to_date"}}],properties:{description:"Tracks the salary of employees, including the period during which each salary was valid.",displayName:"salaries"}},{tableName:"titles",filePath:"https://assets.getwren.ai/sample_data/employees/titles.parquet",schema:[{columnName:"emp_no",dataType:"INTEGER"},{columnName:"title",dataType:"VARCHAR"},{columnName:"from_date",dataType:"DATE"},{columnName:"to_date",dataType:"DATE"}],columns:[{name:"emp_no",properties:{description:"The employee number",displayName:"emp_no"}},{name:"title",properties:{description:"The title or position held by the employee. Limited to a maximum of 50 characters.",displayName:"title"}},{name:"from_date",properties:{description:"The start date when the employee held this title",displayName:"from_date"}},{name:"to_date",properties:{description:"The end date when the employee held this title. This can be NULL if the employee currently holds the title.",displayName:"to_date"}}],properties:{description:"Tracks the titles (positions) held by employees, including the period during which they held each title.",displayName:"titles"}},{tableName:"dept_emp",filePath:"https://assets.getwren.ai/sample_data/employees/dept_emp.parquet",schema:[{columnName:"emp_no",dataType:"INTEGER"},{columnName:"dept_no",dataType:"VARCHAR"},{columnName:"from_date",dataType:"DATE"},{columnName:"to_date",dataType:"DATE"}],columns:[{name:"emp_no",properties:{description:"The employee number.",displayName:"emp_no"}},{name:"dept_no",properties:{description:"The department number the employee is associated with, referencing the dept_no in the departments table.",displayName:"dept_no"}},{name:"from_date",properties:{description:"The start date of the employee's association with the department.",displayName:"from_date"}},{name:"to_date",properties:{description:"The end date of the employee's association with the department",displayName:"to_date"}}],properties:{displayName:"dept_emp"}},{tableName:"departments",filePath:"https://assets.getwren.ai/sample_data/employees/departments.parquet",schema:[{columnName:"dept_name",dataType:"VARCHAR"},{columnName:"dept_no",dataType:"VARCHAR"}],columns:[{name:"dept_name",properties:{description:"The name of the department. Limited to a maximum of 40 characters. This column is also unique across the table, ensuring no two departments share the same name",displayName:"dept_name"}},{name:"dept_no",properties:{description:"A unique identifier for each department. It serves as the primary key of the table.",displayName:"dept_no"}}],properties:{displayName:"departments"}},{tableName:"employees",filePath:"https://assets.getwren.ai/sample_data/employees/employees.parquet",schema:[{columnName:"birth_date",dataType:"DATE"},{columnName:"first_name",dataType:"VARCHAR"},{columnName:"last_name",dataType:"VARCHAR"},{columnName:"gender",dataType:"VARCHAR"},{columnName:"hire_date",dataType:"DATE"},{columnName:"emp_no",dataType:"INTEGER"}],columns:[{name:"birth_date",properties:{description:"The birth date of the employee.",displayName:"birth_date"}},{name:"first_name",properties:{description:"The first name of the employee. Limited to a maximum of 14 characters.",displayName:"first_name"}},{name:"last_name",properties:{description:"The last name of the employee. Limited to a maximum of 16 characters.",displayName:"last_name"}},{name:"gender",properties:{description:"The gender of the employee, with possible values 'M' (Male) or 'F' (Female).",displayName:"gender"}},{name:"hire_date",properties:{description:"The date when the employee was hired.",displayName:"hire_date"}},{name:"emp_no",properties:{description:"A unique identifier for each employee. It serves as the primary key of the table",displayName:"emp_no"}}],properties:{description:"Stores basic information about employees such as their employee number, name, gender, birth date, and hire date",displayName:"employees"}},{tableName:"dept_manager",filePath:"https://assets.getwren.ai/sample_data/employees/dept_manager.parquet",schema:[{columnName:"from_date",dataType:"DATE"},{columnName:"to_date",dataType:"DATE"},{columnName:"emp_no",dataType:"INTEGER"},{columnName:"dept_no",dataType:"VARCHAR"}],columns:[{name:"from_date",properties:{description:"The start date of the employee’s managerial role in the department.",displayName:"from_date"}},{name:"to_date",properties:{description:"The end date of the employee’s managerial role in the department.",displayName:"to_date"}},{name:"emp_no",properties:{description:"The employee number of the department manager",displayName:"emp_no"}},{name:"dept_no",properties:{description:"The department number that the manager is assigned to, referencing the dept_no in the departments table.",displayName:"dept_no"}}],properties:{description:"Tracks the assignment of managers to departments, including the period during which they managed a department",displayName:"dept_manager"}}],relations:[{fromModelName:"employees",fromColumnName:"emp_no",toModelName:"titles",toColumnName:"emp_no",type:i.uT.ONE_TO_MANY,description:"Each entry represents a title held by an employee during a specific time period."},{fromModelName:"departments",fromColumnName:"dept_no",toModelName:"dept_emp",toColumnName:"dept_no",type:i.uT.ONE_TO_MANY},{fromModelName:"employees",fromColumnName:"emp_no",toModelName:"salaries",toColumnName:"emp_no",type:i.uT.ONE_TO_MANY},{fromModelName:"dept_manager",fromColumnName:"emp_no",toModelName:"employees",toColumnName:"emp_no",type:i.uT.MANY_TO_ONE},{fromModelName:"dept_emp",fromColumnName:"emp_no",toModelName:"employees",toColumnName:"emp_no",type:i.uT.MANY_TO_ONE,description:"meaning an employee can be associated with multiple departments, titles, and salaries over time."},{fromModelName:"departments",fromColumnName:"dept_no",toModelName:"dept_manager",toColumnName:"dept_no",type:i.uT.ONE_TO_MANY}],questions:[{question:"What is the average salary for each position?",label:"Aggregation"},{question:"Compare the average salary of male and female employees in each department.",label:"Comparison"},{question:"What are the names of the managers and the departments they manage?",label:"Associating"}]},music:{name:r.MUSIC,tables:[{tableName:"album",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/Album.csv",schema:[{columnName:"AlbumId",dataType:"INT"},{columnName:"Title",dataType:"varchar"},{columnName:"ArtistId",dataType:"INT"}]},{tableName:"artist",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/Artist.csv",schema:[{columnName:"ArtistId",dataType:"INT"},{columnName:"Name",dataType:"varchar"}]},{tableName:"customer",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/Customer.csv",schema:[{columnName:"CustomerId",dataType:"BIGINT"},{columnName:"FirstName",dataType:"VARCHAR"},{columnName:"LastName",dataType:"VARCHAR"},{columnName:"Company",dataType:"VARCHAR"},{columnName:"Address",dataType:"VARCHAR"},{columnName:"City",dataType:"VARCHAR"},{columnName:"State",dataType:"VARCHAR"},{columnName:"Country",dataType:"VARCHAR"},{columnName:"PostalCode",dataType:"VARCHAR"},{columnName:"Phone",dataType:"VARCHAR"},{columnName:"Fax",dataType:"VARCHAR"},{columnName:"Email",dataType:"VARCHAR"},{columnName:"SupportRepId",dataType:"BIGINT"}]},{tableName:"genre",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/Genre.csv",schema:[{columnName:"GenreId",dataType:"BIGINT"},{columnName:"Name",dataType:"VARCHAR"}]},{tableName:"invoice",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/Invoice.csv",schema:[{columnName:"InvoiceId",dataType:"BIGINT"},{columnName:"CustomerId",dataType:"BIGINT"},{columnName:"InvoiceDate",dataType:"Date"},{columnName:"BillingAddress",dataType:"VARCHAR"},{columnName:"BillingCity",dataType:"VARCHAR"},{columnName:"BillingState",dataType:"VARCHAR"},{columnName:"BillingCountry",dataType:"VARCHAR"},{columnName:"BillingPostalCode",dataType:"VARCHAR"},{columnName:"Total",dataType:"DOUBLE"}]},{tableName:"invoiceLine",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/InvoiceLine.csv",schema:[{columnName:"InvoiceLineId",dataType:"BIGINT"},{columnName:"InvoiceId",dataType:"BIGINT"},{columnName:"TrackId",dataType:"BIGINT"},{columnName:"UnitPrice",dataType:"DOUBLE"},{columnName:"Quantity",dataType:"BIGINT"}]},{tableName:"track",filePath:"https://wrenai-public.s3.amazonaws.com/demo/Music/Track.csv",schema:[{columnName:"TrackId",dataType:"BIGINT"},{columnName:"Name",dataType:"VARCHAR"},{columnName:"AlbumId",dataType:"BIGINT"},{columnName:"MediaTypeId",dataType:"BIGINT"},{columnName:"GenreId",dataType:"BIGINT"},{columnName:"Composer",dataType:"VARCHAR"},{columnName:"Milliseconds",dataType:"BIGINT"},{columnName:"Bytes",dataType:"BIGINT"},{columnName:"UnitPrice",dataType:"DOUBLE"}]}],questions:[{question:"What are the top 5 selling albums in the US?",label:"Ranking"},{question:"What is the total revenue generated from each genre?",label:"Aggregation"},{question:"Which customers have made purchases of tracks from albums in each genre?",label:"General"}],relations:[{fromModelName:"album",fromColumnName:"ArtistId",toModelName:"artist",toColumnName:"ArtistId",type:i.uT.MANY_TO_ONE},{fromModelName:"customer",fromColumnName:"CustomerId",toModelName:"invoice",toColumnName:"CustomerId",type:i.uT.ONE_TO_MANY},{fromModelName:"genre",fromColumnName:"GenreId",toModelName:"track",toColumnName:"GenreId",type:i.uT.ONE_TO_MANY},{fromModelName:"invoice",fromColumnName:"InvoiceId",toModelName:"invoiceLine",toColumnName:"InvoiceId",type:i.uT.ONE_TO_MANY},{fromModelName:"track",fromColumnName:"TrackId",toModelName:"invoiceLine",toColumnName:"TrackId",type:i.uT.ONE_TO_MANY},{fromModelName:"album",fromColumnName:"AlbumId",toModelName:"track",toColumnName:"AlbumId",type:i.uT.ONE_TO_MANY}]},ecommerce:{name:r.ECOMMERCE,tables:[{tableName:"olist_customers_dataset",primaryKey:"customer_id",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_customers_dataset.parquet",properties:{displayName:"customers"},columns:[{name:"customer_city",properties:{description:"Name of the city where the customer is located",displayName:"customer_city"}},{name:"customer_id",properties:{description:null,displayName:"customer_id"}},{name:"customer_state",properties:{description:"Name of the state where the customer is located",displayName:"customer_state"}},{name:"customer_unique_id",properties:{description:"Unique id of the customer",displayName:"customer_unique_id"}},{name:"customer_zip_code_prefix",properties:{description:"First 5 digits of customer zip code",displayName:"customer_zip_code_prefix"}}],schema:[{columnName:"customer_city",dataType:"VARCHAR"},{columnName:"customer_id",dataType:"VARCHAR"},{columnName:"customer_state",dataType:"VARCHAR"},{columnName:"customer_unique_id",dataType:"VARCHAR"},{columnName:"customer_zip_code_prefix",dataType:"VARCHAR"}]},{tableName:"olist_order_items_dataset",primaryKey:"order_item_id",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_order_items_dataset.parquet",properties:{displayName:"order items",description:"This table contains the information related to a specific order containing its shipping cost, products, cost, number of order items, and the seller."},columns:[{name:"freight_value",properties:{description:"Cost of shipping associated with the specific order item",displayName:"freight_value"}},{name:"order_id",properties:{description:"Unique identifier for the order across the platform",displayName:"order_id"}},{name:"order_item_id",properties:{description:"Unique identifier for each item within a specific order",displayName:"order_item_id"}},{name:"price",properties:{description:"Price of the individual item within the order",displayName:"price"}},{name:"product_id",properties:{description:"Unique identifier for the product sold in the order.",displayName:"product_id"}},{name:"seller_id",properties:{description:"Unique identifier of the seller who fulfilled the order item.",displayName:"seller_id"}},{name:"shipping_limit_date",properties:{description:"Deadline for the order item to be shipped by the seller.",displayName:"shipping_limit_date"}}],schema:[{columnName:"freight_value",dataType:"DOUBLE"},{columnName:"order_id",dataType:"VARCHAR"},{columnName:"order_item_id",dataType:"BIGINT"},{columnName:"price",dataType:"DOUBLE"},{columnName:"product_id",dataType:"VARCHAR"},{columnName:"seller_id",dataType:"VARCHAR"},{columnName:"shipping_limit_date",dataType:"TIMESTAMP"}]},{tableName:"olist_orders_dataset",primaryKey:"order_id",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_orders_dataset.parquet",properties:{displayName:"orders",description:"This table contains detailed information about customer orders, including timestamps for various stages of the order process (approval, shipping, delivery), as well as the order status and customer identification. It helps track the lifecycle of an order from purchase to delivery."},columns:[{name:"customer_id",properties:{description:"Unique identifier for the customer who placed the order.",displayName:"customer_id"}},{name:"order_approved_at",properties:{description:"Date and time when the order was approved for processing.",displayName:"order_approved_at"}},{name:"order_delivered_carrier_date",properties:{description:"Date when the order was handed over to the carrier or freight forwarder for delivery.",displayName:"order_delivered_carrier_date"}},{name:"order_delivered_customer_date",properties:{description:"Date when the order was delivered to the customer.",displayName:"order_delivered_customer_date"}},{name:"order_estimated_delivery_date",properties:{description:"Expected delivery date based on the initial estimate.",displayName:"order_estimated_delivery_date"}},{name:"order_id",properties:{description:"Unique identifier for the specific order",displayName:"order_id"}},{name:"order_purchase_timestamp",properties:{description:"Date and time when the order was placed by the customer.",displayName:"order_purchase_timestamp"}},{name:"order_status",properties:{description:"Current status of the order (e.g., delivered, shipped, canceled).",displayName:"order_status"}}],schema:[{columnName:"customer_id",dataType:"VARCHAR"},{columnName:"order_approved_at",dataType:"TIMESTAMP"},{columnName:"order_delivered_carrier_date",dataType:"TIMESTAMP"},{columnName:"order_delivered_customer_date",dataType:"TIMESTAMP"},{columnName:"order_estimated_delivery_date",dataType:"TIMESTAMP"},{columnName:"order_id",dataType:"VARCHAR"},{columnName:"order_purchase_timestamp",dataType:"TIMESTAMP"},{columnName:"order_status",dataType:"VARCHAR"}]},{tableName:"olist_order_payments_dataset",primaryKey:"order_id",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_order_payments_dataset.parquet",properties:{displayName:"order payments",description:"This table contains information about payment details for each order, including payment methods, amounts, installment plans, and payment sequences, helping to track how orders were paid and processed within the e-commerce platform."},columns:[{name:"order_id",properties:{description:"Unique identifier for the order associated with the payment.",displayName:"order_id"}},{name:"payment_installments",properties:{description:"Number of installments the payment is divided into for the order.",displayName:"payment_installments"}},{name:"payment_sequential",properties:{description:"Sequence number for tracking multiple payments within the same order.",displayName:"payment_sequential"}},{name:"payment_type",properties:{description:"Method used for the payment, such as credit card, debit, or voucher.",displayName:"payment_type"}},{name:"payment_value",properties:{description:"Total amount paid in the specific transaction.",displayName:"payment_value"}}],schema:[{columnName:"order_id",dataType:"VARCHAR"},{columnName:"payment_installments",dataType:"BIGINT"},{columnName:"payment_sequential",dataType:"BIGINT"},{columnName:"payment_type",dataType:"VARCHAR"},{columnName:"payment_value",dataType:"DOUBLE"}]},{tableName:"olist_products_dataset",primaryKey:"product_id",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_products_dataset.parquet",properties:{displayName:"products",description:"This table provides detailed information about products, including their category, dimensions, weight, description length, and the number of photos. This helps in managing product details and enhancing the shopping experience on the e-commerce platform."},columns:[{name:"product_category_name",properties:{description:"Name of the product category to which the item belongs.",displayName:"product_category_name"}},{name:"product_description_lenght",properties:{description:"Length of the product description in characters.",displayName:"product_description_lenght"}},{name:"product_height_cm",properties:{description:"Height of the product in centimeters.",displayName:"product_height_cm"}},{name:"product_id",properties:{description:"Unique identifier for the product",displayName:"product_id"}},{name:"product_length_cm",properties:{description:"Length of the product in centimeters",displayName:"product_length_cm"}},{name:"product_name_lenght",properties:{description:"Length of the product name in characters",displayName:"product_name_lenght"}},{name:"product_photos_qty",properties:{description:"Number of photos available for the product",displayName:"product_photos_qty"}},{name:"product_weight_g",properties:{description:"Weight of the product in grams",displayName:"product_weight_g"}},{name:"product_width_cm",properties:{description:"Width of the product in centimeters",displayName:"product_width_cm"}}],schema:[{columnName:"product_category_name",dataType:"VARCHAR"},{columnName:"product_description_lenght",dataType:"BIGINT"},{columnName:"product_height_cm",dataType:"BIGINT"},{columnName:"product_id",dataType:"VARCHAR"},{columnName:"product_length_cm",dataType:"BIGINT"},{columnName:"product_name_lenght",dataType:"BIGINT"},{columnName:"product_photos_qty",dataType:"BIGINT"},{columnName:"product_weight_g",dataType:"BIGINT"},{columnName:"product_width_cm",dataType:"BIGINT"}]},{tableName:"olist_order_reviews_dataset",primaryKey:"review_id",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_order_reviews_dataset.parquet",properties:{displayName:"order reviews",description:"This table contains customer reviews for each order, including feedback comments, ratings, and timestamps for when the review was submitted and responded to. It helps track customer satisfaction and review management on the e-commerce platform."},columns:[{name:"order_id",properties:{description:"Unique identifier linking the review to the corresponding order.",displayName:"order_id"}},{name:"review_answer_timestamp",properties:{description:"Date and time when the review was responded to by the seller",displayName:"review_answer_timestamp"}},{name:"review_comment_message",properties:{description:"Detailed feedback or comments provided by the customer regarding the order.",displayName:"review_comment_message"}},{name:"review_comment_title",properties:{description:"Summary or title of the customer's review",displayName:"review_comment_title"}},{name:"review_creation_date",properties:{description:"Date and time when the customer initially submitted the review.",displayName:"review_creation_date"}},{name:"review_id",properties:{description:"Unique identifier for the specific review entry.",displayName:"review_id"}},{name:"review_score",properties:{description:"Numeric rating given by the customer, typically ranging from 1 (worst) to 5 (best).",displayName:"review_score"}}],schema:[{columnName:"order_id",dataType:"VARCHAR"},{columnName:"review_answer_timestamp",dataType:"TIMESTAMP"},{columnName:"review_comment_message",dataType:"VARCHAR"},{columnName:"review_comment_title",dataType:"VARCHAR"},{columnName:"review_creation_date",dataType:"TIMESTAMP"},{columnName:"review_id",dataType:"VARCHAR"},{columnName:"review_score",dataType:"BIGINT"}]},{tableName:"olist_geolocation_dataset",primaryKey:"",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_geolocation_dataset.parquet",properties:{displayName:"geolocation",description:"This table contains detailed information about Brazilian zip codes and their corresponding latitude and longitude coordinates. It can be used to plot maps, calculate distances between sellers and customers, and perform geographic analysis."},columns:[{name:"geolocation_city",properties:{displayName:"geolocation_city",description:"The city name of the geolocation"}},{name:"geolocation_lat",properties:{displayName:"geolocation_lat",description:"The coordinations for the locations latitude"}},{name:"geolocation_lng",properties:{displayName:"geolocation_lng",description:"The coordinations for the locations longitude"}},{name:"geolocation_state",properties:{displayName:"geolocation_state",description:"The state of the geolocation"}},{name:"geolocation_zip_code_prefix",properties:{displayName:"geolocation_zip_code_prefix",description:"First 5 digits of zip code"}}],schema:[{columnName:"geolocation_city",dataType:"VARCHAR"},{columnName:"geolocation_lat",dataType:"DOUBLE"},{columnName:"geolocation_lng",dataType:"DOUBLE"},{columnName:"geolocation_state",dataType:"VARCHAR"},{columnName:"geolocation_zip_code_prefix",dataType:"VARCHAR"}]},{tableName:"olist_sellers_dataset",primaryKey:"",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/olist_sellers_dataset.parquet",properties:{displayName:"sellers",description:"This table includes data about the sellers that fulfilled orders made. Use it to find the seller location and to identify which seller fulfilled each product."},columns:[{name:"seller_city",properties:{description:"The Brazilian city where the seller is located",displayName:"seller_city"}},{name:"seller_id",properties:{description:"Unique identifier for the seller on the platform",displayName:"seller_id"}},{name:"seller_state",properties:{description:"The Brazilian state where the seller is located",displayName:"seller_state"}},{name:"seller_zip_code_prefix",properties:{description:"First 5 digits of seller zip code",displayName:"seller_zip_code_prefix"}}],schema:[{columnName:"seller_city",dataType:"VARCHAR"},{columnName:"seller_id",dataType:"VARCHAR"},{columnName:"seller_state",dataType:"VARCHAR"},{columnName:"seller_zip_code_prefix",dataType:"VARCHAR"}]},{tableName:"product_category_name_translation",primaryKey:"product_category_name",filePath:"https://assets.getwren.ai/sample_data/brazilian-ecommerce/product_category_name_translation.parquet",properties:{displayName:"product category name translation",description:"This table contains translations of product categories from Portuguese to English."},columns:[{name:"product_category_name",properties:{description:"Original name of the product category in Portuguese.",displayName:"product_category_name"}},{name:"product_category_name_english",properties:{description:"Translated name of the product category in English.",displayName:"product_category_name_english"}}],schema:[{columnName:"product_category_name",dataType:"VARCHAR"},{columnName:"product_category_name_english",dataType:"VARCHAR"}]}],questions:[{question:"Which are the top 3 cities with the highest number of orders?",label:"Ranking"},{question:"What is the average score of reviews submitted for orders placed by customers in each city?",label:"Aggregation"},{question:"What is the total value of payments made by customers from each state?",label:"Aggregation"}],relations:[{fromModelName:"olist_orders_dataset",fromColumnName:"customer_id",toModelName:"olist_customers_dataset",toColumnName:"customer_id",type:i.uT.MANY_TO_ONE},{fromModelName:"olist_orders_dataset",fromColumnName:"order_id",toModelName:"olist_order_items_dataset",toColumnName:"order_id",type:i.uT.ONE_TO_MANY},{fromModelName:"olist_orders_dataset",fromColumnName:"order_id",toModelName:"olist_order_reviews_dataset",toColumnName:"order_id",type:i.uT.ONE_TO_MANY},{fromModelName:"olist_orders_dataset",fromColumnName:"order_id",toModelName:"olist_order_payments_dataset",toColumnName:"order_id",type:i.uT.ONE_TO_MANY},{fromModelName:"olist_order_items_dataset",fromColumnName:"product_id",toModelName:"olist_products_dataset",toColumnName:"product_id",type:i.uT.MANY_TO_ONE},{fromModelName:"olist_order_items_dataset",fromColumnName:"seller_id",toModelName:"olist_sellers_dataset",toColumnName:"seller_id",type:i.uT.MANY_TO_ONE},{fromModelName:"olist_geolocation_dataset",fromColumnName:"geolocation_zip_code_prefix",toModelName:"olist_customers_dataset",toColumnName:"customer_zip_code_prefix",type:i.uT.ONE_TO_MANY},{fromModelName:"olist_geolocation_dataset",fromColumnName:"geolocation_zip_code_prefix",toModelName:"olist_sellers_dataset",toColumnName:"seller_zip_code_prefix",type:i.uT.ONE_TO_MANY},{fromModelName:"product_category_name_translation",fromColumnName:"product_category_name",toModelName:"olist_products_dataset",toColumnName:"product_category_name",type:i.uT.ONE_TO_MANY}]},nba:{name:r.NBA,tables:[{tableName:"game",primaryKey:"Id",filePath:"https://wrenai-public.s3.amazonaws.com/demo/v0.3.0/NBA/game.csv",columns:[{name:"Id"},{name:"SeasonId"},{name:"TeamIdHome"},{name:"WlHome"},{name:"Min"},{name:"FgmHome",properties:{description:"number of field goals made by the home team."}},{name:"FgaHome",properties:{description:"number of field goals attempted by the home team."}},{name:"threepHome",properties:{description:"number of three point field goals made by the home team."}},{name:"threepaHome",properties:{description:"number of three point field goals attempted by the home team."}},{name:"FtmHome",properties:{description:"number of free throws made by the home team."}},{name:"FtaHome",properties:{description:"number of free throws attempted by the home team."}},{name:"OrebHome",properties:{description:"number of offensive rebounds by the home team."}},{name:"DrebHome",properties:{description:"number of defensive rebounds by the home team."}},{name:"RebHome",properties:{description:"number of rebounds by the home team."}},{name:"AstHome",properties:{description:"number of assists by the home team."}},{name:"StlHome",properties:{description:"number of steels by the home team."}},{name:"BlkHome",properties:{description:"number of blocks by the home team."}},{name:"TovHome",properties:{description:"number of turnovers by the home team."}},{name:"PfHome",properties:{description:"number of personal fouls by the home team."}},{name:"PtsHome",properties:{description:"Total score of the home team."}},{name:"PlusMimusHome"},{name:"TeamIdAway"},{name:"WlAway"},{name:"FgmAway",properties:{description:"number of field goals made by the away team."}},{name:"FgaAway",properties:{description:"number of field goals attempted by the away team."}},{name:"threepAway",properties:{description:"number of three point field goals made by the away team."}},{name:"threepaAway",properties:{description:"number of three point field goals attempted by the away team."}},{name:"FtmAway",properties:{description:"number of free throws made by the away team."}},{name:"FtaAway",properties:{description:"number of free throws attempted by the away team."}},{name:"OrebAway",properties:{description:"number of offensive rebounds by the away team."}},{name:"DrebAway",properties:{description:"number of defensive rebounds by the away team."}},{name:"RebAway",properties:{description:"number of rebounds by the away team."}},{name:"AstAway",properties:{description:"number of assists by the away team."}},{name:"StlAway",properties:{description:"number of steels by the away team."}},{name:"BlkAway",properties:{description:"number of blocks by the away team."}},{name:"TovAway",properties:{description:"number of turnovers by the away team."}},{name:"PfAway",properties:{description:"number of personal fouls by the away team."}},{name:"PtsAway",properties:{description:"Total score of the away team."}},{name:"PlusMimusAway"},{name:"seasonType"}],schema:[{columnName:"SeasonId",dataType:"BIGINT"},{columnName:"TeamIdHome",dataType:"BIGINT"},{columnName:"Id",dataType:"BIGINT"},{columnName:"GameDate",dataType:"DATE"},{columnName:"WlHome",dataType:"VARCHAR"},{columnName:"Min",dataType:"BIGINT"},{columnName:"FgmHome",dataType:"BIGINT"},{columnName:"FgaHome",dataType:"BIGINT"},{columnName:"FgPct_home",dataType:"DOUBLE"},{columnName:"threepHome",dataType:"BIGINT"},{columnName:"threepaHome",dataType:"BIGINT"},{columnName:"fg3_pct_home",dataType:"DOUBLE"},{columnName:"FtmHome",dataType:"BIGINT"},{columnName:"FtaHome",dataType:"BIGINT"},{columnName:"ft_pct_home",dataType:"DOUBLE"},{columnName:"OrebHome",dataType:"BIGINT"},{columnName:"DrebHome",dataType:"BIGINT"},{columnName:"RebHome",dataType:"BIGINT"},{columnName:"AstHome",dataType:"BIGINT"},{columnName:"StlHome",dataType:"BIGINT"},{columnName:"BlkHome",dataType:"BIGINT"},{columnName:"TovHome",dataType:"BIGINT"},{columnName:"PfHome",dataType:"BIGINT"},{columnName:"PtsHome",dataType:"BIGINT"},{columnName:"PlusMinusHome",dataType:"BIGINT"},{columnName:"TeamIdAway",dataType:"BIGINT"},{columnName:"WlAway",dataType:"VARCHAR"},{columnName:"FgmAway",dataType:"BIGINT"},{columnName:"FgaAway",dataType:"BIGINT"},{columnName:"fg_pct_away",dataType:"DOUBLE"},{columnName:"threepAway",dataType:"BIGINT"},{columnName:"threepaAway",dataType:"BIGINT"},{columnName:"Fg3_pct_away",dataType:"DOUBLE"},{columnName:"FtmAway",dataType:"BIGINT"},{columnName:"FtaAway",dataType:"BIGINT"},{columnName:"Ft_pct_away",dataType:"DOUBLE"},{columnName:"OrebAway",dataType:"BIGINT"},{columnName:"DrebAway",dataType:"BIGINT"},{columnName:"RebAway",dataType:"BIGINT"},{columnName:"AstAway",dataType:"BIGINT"},{columnName:"StlAway",dataType:"BIGINT"},{columnName:"BlkAway",dataType:"BIGINT"},{columnName:"TovAway",dataType:"BIGINT"},{columnName:"PfAway",dataType:"BIGINT"},{columnName:"PtsAway",dataType:"BIGINT"},{columnName:"PlusMinusAway",dataType:"BIGINT"},{columnName:"SeasonType",dataType:"VARCHAR"}],properties:{description:'This table describes the game statistics for both the home and away teams in each NBA game. Turnover percentage is the number of possessions that end in a turnover. The formula for turnover percentage (TOV%) is "TOV% = (Tov \xf7 (FGA + (0.44 x FTA) + Tov)) x 100%".'}},{tableName:"line_score",primaryKey:"GameId",filePath:"https://wrenai-public.s3.amazonaws.com/demo/v0.3.0/NBA/line_score.csv",columns:[{name:"GameId"},{name:"GameDate"},{name:"GameSequence"},{name:"TeamIdHome"},{name:"TeamWinsLossesHome"},{name:"PtsQtr1Home",properties:{description:"The score of the home team in the first quarter."}},{name:"PtsQtr2Home",properties:{description:"The score of the home team in the second quarter."}},{name:"PtsQtr3Home",properties:{description:"The score of the home team in the third quarter."}},{name:"PtsQtr4Home",properties:{description:"The score of the home team in the fourth quarter."}},{name:"PtsOt1Home",properties:{description:"The score of the home team in the overtime. The value of 0 indicates that the game did not go into overtime."}},{name:"PtsHome",properties:{description:"Total score of the home team."}},{name:"TeamIdAway"},{name:"TeamWinsLossesAway"},{name:"PtsQtr1Away",properties:{description:"The score of the away team in the first quarter."}},{name:"PtsQtr2Away",properties:{description:"The score of the away team in the second quarter."}},{name:"PtsQtr3Away",properties:{description:"The score of the away team in the third quarter."}},{name:"PtsQtr4Away",properties:{description:"The score of the away team in the fourth quarter."}},{name:"PtsOt1Away",properties:{description:"The score of the away team in the overtime. The value of 0 indicates that the game did not go into overtime."}},{name:"PtsAway",properties:{description:"Total score of the away team."}}],schema:[{columnName:"GameDate",dataType:"DATE"},{columnName:"GameSequence",dataType:"BIGINT"},{columnName:"GameId",dataType:"BIGINT"},{columnName:"TeamIdHome",dataType:"BIGINT"},{columnName:"TeamWinsLossesHome",dataType:"VARCHAR"},{columnName:"PtsQtr1Home",dataType:"BIGINT"},{columnName:"PtsQtr2Home",dataType:"BIGINT"},{columnName:"PtsQtr3Home",dataType:"BIGINT"},{columnName:"PtsQtr4Home",dataType:"BIGINT"},{columnName:"PtsOt1Home",dataType:"BIGINT"},{columnName:"PtsHome",dataType:"BIGINT"},{columnName:"TeamIdAway",dataType:"BIGINT"},{columnName:"TeamWinsLossesAway",dataType:"VARCHAR"},{columnName:"PtsQtr1Away",dataType:"BIGINT"},{columnName:"PtsQtr2Away",dataType:"BIGINT"},{columnName:"PtsQtr3Away",dataType:"BIGINT"},{columnName:"PtsQtr4Away",dataType:"BIGINT"},{columnName:"PtsOt1Away",dataType:"BIGINT"},{columnName:"PtsAway",dataType:"BIGINT"}],properties:{description:"This table describes the scores and total score for each quarter or overtime of an NBA game, detailing the scores for both the home team and the away team."}},{tableName:"player_games",primaryKey:"Id",filePath:"https://wrenai-public.s3.amazonaws.com/demo/v0.3.0/NBA/player_game.csv",columns:[{name:"Id"},{name:"GameId"},{name:"PlayerId"},{name:"Date"},{name:"Age",properties:{description:'player age. The format is "age-days"'}},{name:"Tm",properties:{description:"team affiliation."}},{name:"Opp",properties:{description:"opposing team."}},{name:"MP",properties:{description:"minutes played"}},{name:"FG",properties:{description:"number of two point field goals made."}},{name:"FGA",properties:{description:"number of two point field goals attempted (do not include free throws)."}},{name:"threeP",properties:{description:"number of three point field goals made."}},{name:"threePA",properties:{description:"number of three point field goals attempted."}},{name:"FT",properties:{description:"number of free throws made."}},{name:"FTA",properties:{description:"number of free throws attempted."}},{name:"ORB",properties:{description:"number of offensive rebounds."}},{name:"DRB",properties:{description:"number of defensive rebounds."}},{name:"AST",properties:{description:"number of assists."}},{name:"STL",properties:{description:"number of Steals."}},{name:"BLK",properties:{description:"number of blocks."}},{name:"TOV",properties:{description:"number of turnovers allowed"}},{name:"PF",properties:{description:"number of personal fouls"}},{name:"PTS",properties:{description:"total score"}}],schema:[{columnName:"Id",dataType:"BIGINT"},{columnName:"PlayerID",dataType:"BIGINT"},{columnName:"GameID",dataType:"BIGINT"},{columnName:"Date",dataType:"DATE"},{columnName:"Age",dataType:"VARCHAR"},{columnName:"Tm",dataType:"VARCHAR"},{columnName:"Opp",dataType:"VARCHAR"},{columnName:"MP",dataType:"VARCHAR"},{columnName:"FG",dataType:"BIGINT"},{columnName:"FGA",dataType:"BIGINT"},{columnName:"threeP",dataType:"BIGINT"},{columnName:"threePA",dataType:"BIGINT"},{columnName:"FT",dataType:"BIGINT"},{columnName:"FTA",dataType:"BIGINT"},{columnName:"ORB",dataType:"BIGINT"},{columnName:"DRB",dataType:"BIGINT"},{columnName:"TRB",dataType:"BIGINT"},{columnName:"AST",dataType:"BIGINT"},{columnName:"STL",dataType:"BIGINT"},{columnName:"BLK",dataType:"BIGINT"},{columnName:"TOV",dataType:"BIGINT"},{columnName:"PF",dataType:"BIGINT"},{columnName:"PTS",dataType:"BIGINT"}],properties:{description:'This table describes the game statistics for each NBA player in every game. Turnover percentage is the number of possessions that end in a turnover. The formula for turnover percentage (TOV%) is "TOV% = (Tov \xf7 (FGA + (0.44 x FTA) + Tov)) x 100%".'}},{tableName:"player",primaryKey:"Id",filePath:"https://wrenai-public.s3.amazonaws.com/demo/v0.3.0/NBA/player.csv",columns:[{name:"Id"},{name:"TeamId"},{name:"FullName"},{name:"FirstName"},{name:"LastName"}],schema:[{columnName:"Id",dataType:"BIGINT"},{columnName:"TeamId",dataType:"BIGINT"},{columnName:"FullName",dataType:"VARCHAR"},{columnName:"FirstName",dataType:"VARCHAR"},{columnName:"LastName",dataType:"VARCHAR"}],properties:{description:"This table describes NBA players by their ID, name, and team affiliation."}},{tableName:"team",primaryKey:"Id",filePath:"https://wrenai-public.s3.amazonaws.com/demo/v0.3.0/NBA/team.csv",columns:[{name:"Id"},{name:"FullName"},{name:"Abbreviation"},{name:"Nickname"},{name:"City"},{name:"State"},{name:"YearFounded"}],schema:[{columnName:"Id",dataType:"BIGINT"},{columnName:"FullName",dataType:"VARCHAR"},{columnName:"Abbreviation",dataType:"VARCHAR"},{columnName:"Nickname",dataType:"VARCHAR"},{columnName:"City",dataType:"VARCHAR"},{columnName:"State",dataType:"VARCHAR"},{columnName:"YearFounded",dataType:"INT"}],properties:{description:"This table describes NBA teams by their ID, team name, team abbreviation, and founding date."}}],questions:[{question:"How many three-pointers were made by each player in each game?",label:"Aggregation"},{question:"What is the differences in turnover rates between teams with high and low average scores?",label:"Comparison"},{question:"Which teams had the highest average points scored per game throughout the season?",label:"Ranking"}],relations:[{fromModelName:"game",fromColumnName:"Id",toModelName:"line_score",toColumnName:"GameId",type:i.uT.ONE_TO_MANY},{fromModelName:"line_score",fromColumnName:"GameId",toModelName:"player_games",toColumnName:"GameID",type:i.uT.ONE_TO_MANY},{fromModelName:"player",fromColumnName:"TeamId",toModelName:"team",toColumnName:"Id",type:i.uT.ONE_TO_ONE},{fromModelName:"team",fromColumnName:"Id",toModelName:"game",toColumnName:"TeamIdHome",type:i.uT.ONE_TO_MANY}]}},o=e=>n[e.toLowerCase()].tables.map(e=>{let t=e.schema?.map(({columnName:e,dataType:t})=>`'${e}': '${t}'`).join(", ");return((t,a)=>{if("csv"!==t&&"parquet"!==t)throw Error(`Unsupported file type: ${t}`);let r=`CREATE TABLE ${e.tableName} AS select * FROM read_${t}('${e.filePath}'`,i="csv"===t&&a?`, columns={${a}}`:"";return`${r}${"csv"===t?",header=true":""}${i});`})(e.filePath.split(".").pop(),t)}).join("\n"),s=e=>n[e.toLowerCase()].relations,d=e=>n[e.toLowerCase()].questions},7280:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{U:()=>i.U});var i=a(3189),n=a(678),o=e([n]);n=(o.then?(await o)():o)[0],r()}catch(e){r(e)}})},2305:(e,t,a)=>{a.d(t,{Z:()=>y});var r,i=a(6897),n=a.n(i);let o=require("lodash/differenceWith");var s=a.n(o),d=a(9699),l=a.n(d);let m=require("lodash/isEqual");var p=a.n(m);let c=require("lodash/uniqBy");var u=a.n(c);let h=(0,a(8094).getLogger)("DataSourceSchemaDetector");h.level="debug",function(e){e.DELETED_TABLES="deletedTables",e.DELETED_COLUMNS="deletedColumns",e.MODIFIED_COLUMNS="modifiedColumns"}(r||(r={}));class y{constructor({ctx:e,projectId:t}){this.ctx=e,this.projectId=t}async detectSchemaChange(){let e=await this.getDiffSchema();if(e)await this.addSchemaChange(e);else{let e=await this.ctx.schemaChangeRepository.findLastSchemaChange(this.projectId);null!==e&&Object.values(e.resolve).some(e=>!e)&&await this.updateResolveToSchemaChange(e,Object.values(r))}return!!e}async resolveSchemaChange(e){let t=n()(e);if(!["deletedTables","deletedColumns"].includes(t))throw Error("Resolved scheme change type is not supported.");let a=await this.ctx.schemaChangeRepository.findLastSchemaChange(this.projectId),r=a?.change[t];if(a?.resolve[t])throw Error(`Schema change "${t}" has nothing to resolve.`);let i=await this.ctx.modelRepository.findAllBy({projectId:this.projectId}),o=i.map(e=>e.id),s=await this.ctx.modelColumnRepository.findColumnsByModelIds(o),d=await this.ctx.relationRepository.findRelationInfoBy({modelIds:o}),l=this.getAffectedResources(r,{models:i,modelColumns:s,modelRelationships:d});if(await Promise.all(l.map(async e=>{h.debug(`Start to remove all affected calculated fields "${e.calculatedFields.map(e=>`${e.displayName} (${e.referenceName})`)}".`);let a=e.calculatedFields.map(e=>e.id);if(await this.ctx.modelColumnRepository.deleteAllByColumnIds(a),"deletedColumns"===t){let t=e.columns.map(e=>e.sourceColumnName);h.debug(`Start to remove columns "${t}" from model "${e.referenceName}".`),await this.ctx.modelColumnRepository.deleteAllBySourceColumnNames(e.modelId,t)}})),"deletedTables"===t){let e=r.map(e=>e.name);h.debug(`Start to remove tables "${e}" from models.`),await this.ctx.modelRepository.deleteAllBySourceTableNames(e)}await this.updateResolveToSchemaChange(a,[t])}getAffectedResources(e,{models:t,modelColumns:a,modelRelationships:r}){return t.filter(t=>-1!==e.findIndex(e=>e.name===t.sourceTableName)).map(i=>{let n=e.find(e=>e.name===i.sourceTableName).columns,o=a.filter(e=>e.isCalculated),s=n.reduce((e,n)=>{let s=a.find(e=>e.sourceColumnName===n.name&&e.modelId===i.id);e.columns.push({sourceColumnName:n.name,displayName:s.displayName,type:n.type});let d=o.filter(e=>{let t=JSON.parse(e.lineage);return t&&t[t.length-1]===s.id});return e.calculatedFields.push(...d),r.map(e=>[e.fromColumnId,e.toColumnId].includes(s.id)?e:null).filter(e=>!!e).forEach(a=>{let r=i.referenceName===a.fromModelName?a.toModelName:a.fromModelName,n=t.find(e=>e.referenceName===r)?.displayName;e.relationships.push({displayName:n,id:a.id,referenceName:r});let s=o.filter(e=>{let t=JSON.parse(e.lineage);return t.pop(),t&&t.includes(a.id)});e.calculatedFields.push(...s)}),e},{columns:[],relationships:[],calculatedFields:[]}),d=u()(s.calculatedFields,"id");return{sourceTableName:i.sourceTableName,displayName:i.displayName,referenceName:i.referenceName,modelId:i.id,...s,calculatedFields:d}})}async getDiffSchema(){h.info("Start to detect Data Source Schema changes.");let e=await this.getCurrentSchema(),t=await this.getLatestSchema(),a=e.reduce((e,a)=>{let r=t.find(e=>e.name===a.name);if(!r)return e.deletedTables=[...e.deletedTables||[],a],e;let i=s()(a.columns,r.columns,p());if(i.length>0){let t={name:a.name,columns:[]},n={name:a.name,columns:[]};for(let e of i){let a=r.columns.find(t=>t.name===e.name);if(!a){t.columns.push(e);continue}n.columns.push(a)}t.columns.length>0&&(e.deletedColumns=[...e.deletedColumns||[],t]),n.columns.length>0&&(e.modifiedColumns=[...e.modifiedColumns||[],n])}return e},{});return l()(a)?(h.info("No changes in Data Source Schema."),null):(h.debug("Diff Schema:",JSON.stringify(a)),h.info("Data Source Schema has changed."),a)}async addSchemaChange(e){let t=await this.ctx.schemaChangeRepository.findLastSchemaChange(this.projectId);JSON.stringify(t?.change)!==JSON.stringify(e)&&await this.ctx.schemaChangeRepository.createOne({projectId:this.projectId,change:e,resolve:{deletedTables:!e.deletedTables&&void 0,deletedColumns:!e.deletedColumns&&void 0,modifiedColumns:!e.modifiedColumns&&void 0}})}async getCurrentSchema(){let e=await this.ctx.modelRepository.findAllBy({projectId:this.projectId}),t=e.map(e=>e.id),a=await this.ctx.modelColumnRepository.findColumnsByModelIds(t);return e.map(e=>({name:e.sourceTableName,columns:a.filter(t=>t.modelId===e.id&&!t.isCalculated).map(e=>({name:e.sourceColumnName,type:e.type}))}))}async getLatestSchema(){let e=await this.ctx.projectRepository.findOneBy({id:this.projectId});return(await this.ctx.projectService.getProjectDataSourceTables(e)).map(e=>({name:e.name,columns:e.columns.map(e=>({name:e.name,type:e.type}))}))}async updateResolveToSchemaChange(e,t){await this.ctx.schemaChangeRepository.updateOne(e.id,{resolve:{...e.resolve,...t.reduce((e,t)=>({...e,[t]:!0}),{})}}),h.info(`Schema change "${t}" resolved successfully.`)}}},678:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{Z:()=>E});var i=a(6762),n=a.n(i),o=a(7411),s=a(56),d=a(1610),l=a(1711),m=a(153),p=a(1205),c=a(568),u=a(5285),h=a(1608),y=a(5434),g=a(3642),I=a(9958),N=e([o,s,d,l,p,c,u]);[o,s,d,l,p,c,u]=N.then?(await N)():N;let S=new o.D,T=new s.G,w=new d.V,f=new l.t,R=new m.p,_=new p.t,C=new c.q,A=new u.I,v=new h.Z,b=(e,t,a)=>(...r)=>{let i=r[2];return(0,I.Iy)(t,e,i),a(...r)},D={JSON:n(),DialectSQL:g.m,Query:{listDataSourceTables:b("Query","listDataSourceTables",S.listDataSourceTables),autoGenerateRelation:b("Query","autoGenerateRelation",S.autoGenerateRelation),listModels:b("Query","listModels",T.listModels),model:b("Query","model",T.getModel),onboardingStatus:b("Query","onboardingStatus",S.getOnboardingStatus),modelSync:b("Query","modelSync",T.checkModelSync),diagram:b("Query","diagram",f.getDiagram),schemaChange:b("Query","schemaChange",S.getSchemaChange),askingTask:b("Query","askingTask",w.getAskingTask),suggestedQuestions:b("Query","suggestedQuestions",w.getSuggestedQuestions),instantRecommendedQuestions:b("Query","instantRecommendedQuestions",w.getInstantRecommendedQuestions),adjustmentTask:b("Query","adjustmentTask",w.getAdjustmentTask),thread:b("Query","thread",w.getThread),threads:b("Query","threads",w.listThreads),threadResponse:b("Query","threadResponse",w.getResponse),nativeSql:b("Query","nativeSql",T.getNativeSql),listViews:b("Query","listViews",T.listViews),view:b("Query","view",T.getView),settings:b("Query","settings",S.getSettings),dataSourceConnections:b("Query","dataSourceConnections",S.listDataSourceConnections),getMDL:b("Query","getMDL",T.getMDL),learningRecord:b("Query","learningRecord",R.getLearningRecord),getThreadRecommendationQuestions:b("Query","getThreadRecommendationQuestions",w.getThreadRecommendationQuestions),getProjectRecommendationQuestions:b("Query","getProjectRecommendationQuestions",S.getProjectRecommendationQuestions),dashboardItems:b("Query","dashboardItems",_.getDashboardItems),dashboard:b("Query","dashboard",_.getDashboard),sqlPairs:b("Query","sqlPairs",C.getProjectSqlPairs),instructions:b("Query","instructions",A.getInstructions),apiHistory:b("Query","apiHistory",v.getApiHistory)},Mutation:{deploy:T.deploy,saveDataSource:S.saveDataSource,startSampleDataset:S.startSampleDataset,saveTables:S.saveTables,saveRelations:S.saveRelations,createModel:T.createModel,updateModel:T.updateModel,deleteModel:T.deleteModel,previewModelData:T.previewModelData,updateModelMetadata:T.updateModelMetadata,triggerDataSourceDetection:S.triggerDataSourceDetection,resolveSchemaChange:S.resolveSchemaChange,createCalculatedField:T.createCalculatedField,validateCalculatedField:T.validateCalculatedField,updateCalculatedField:T.updateCalculatedField,deleteCalculatedField:T.deleteCalculatedField,createRelation:T.createRelation,updateRelation:T.updateRelation,deleteRelation:T.deleteRelation,createAskingTask:w.createAskingTask,cancelAskingTask:w.cancelAskingTask,createInstantRecommendedQuestions:w.createInstantRecommendedQuestions,rerunAskingTask:w.rerunAskingTask,adjustThreadResponse:w.adjustThreadResponse,cancelAdjustmentTask:w.cancelAdjustThreadResponseAnswer,rerunAdjustmentTask:w.rerunAdjustThreadResponseAnswer,createThread:w.createThread,updateThread:w.updateThread,deleteThread:w.deleteThread,createThreadResponse:w.createThreadResponse,updateThreadResponse:w.updateThreadResponse,previewData:w.previewData,previewBreakdownData:w.previewBreakdownData,generateThreadResponseBreakdown:w.generateThreadResponseBreakdown,generateThreadResponseAnswer:w.generateThreadResponseAnswer,generateThreadResponseChart:w.generateThreadResponseChart,adjustThreadResponseChart:w.adjustThreadResponseChart,createView:T.createView,deleteView:T.deleteView,previewViewData:T.previewViewData,validateView:T.validateView,updateViewMetadata:T.updateViewMetadata,resetCurrentProject:S.resetCurrentProject,updateCurrentProject:S.updateCurrentProject,updateDataSource:S.updateDataSource,switchDataSource:S.switchDataSource,updateDataSourceConnectionStatus:S.updateDataSourceConnectionStatus,deleteDataSourceConnection:S.deleteDataSourceConnection,previewSql:T.previewSql,saveLearningRecord:R.saveLearningRecord,generateThreadRecommendationQuestions:w.generateThreadRecommendationQuestions,generateProjectRecommendationQuestions:w.generateProjectRecommendationQuestions,updateDashboardItemLayouts:_.updateDashboardItemLayouts,createDashboardItem:_.createDashboardItem,updateDashboardItem:_.updateDashboardItem,deleteDashboardItem:_.deleteDashboardItem,previewItemSQL:_.previewItemSQL,setDashboardSchedule:_.setDashboardSchedule,createSqlPair:C.createSqlPair,updateSqlPair:C.updateSqlPair,deleteSqlPair:C.deleteSqlPair,generateQuestion:C.generateQuestion,modelSubstitute:C.modelSubstitute,createInstruction:A.createInstruction,updateInstruction:A.updateInstruction,deleteInstruction:A.deleteInstruction},ThreadResponse:w.getThreadResponseNestedResolver(),DetailStep:w.getDetailStepNestedResolver(),ResultCandidate:w.getResultCandidateNestedResolver(),DiagramModelField:{type:y.pK},DiagramModelNestedField:{type:y.pK},CompactColumn:{type:y.pK},FieldInfo:{type:y.pK},DetailedColumn:{type:y.pK},DetailedNestedColumn:{type:y.pK},DetailedChangeColumn:{type:y.pK},SqlPair:C.getSqlPairNestedResolver(),ApiHistoryResponse:v.getApiHistoryNestedResolver()};D.Mutation=Object.fromEntries(Object.entries(D.Mutation).map(([e,t])=>[e,b("Mutation",e,t)]));let E=D;r()}catch(e){r(e)}})},1608:(e,t,a)=>{a.d(t,{Z:()=>n});var r=a(5305);let i=(e,t)=>{if(!e)return e;let a={...e};if(t===r.I.RUN_SQL&&a.records&&Array.isArray(a.records)){let e=a.records.length;a.records=[`${e} records omitted`]}if(t===r.I.GENERATE_VEGA_CHART&&a.vegaSpec?.data?.values&&Array.isArray(a.vegaSpec.data.values)){let e=a.vegaSpec.data.values.length;a.vegaSpec.data.values=[`${e} data points omitted`]}return a};class n{constructor(){this.getApiHistoryNestedResolver=()=>({createdAt:e=>e.createdAt?new Date(e.createdAt).toISOString():null,updatedAt:e=>e.updatedAt?new Date(e.updatedAt).toISOString():null,responsePayload:e=>e.responsePayload?Array.isArray(e.responsePayload)?e.responsePayload:i(e.responsePayload,e.apiType):null}),this.getApiHistory=this.getApiHistory.bind(this)}async getApiHistory(e,t,a){let{filter:r,pagination:i}=t,{offset:n,limit:o}=i,s={};r&&(r.apiType&&(s.apiType=r.apiType),r.statusCode&&(s.statusCode=r.statusCode),r.threadId&&(s.threadId=r.threadId),r.projectId&&(s.projectId=r.projectId));let d={};r?.startDate&&(d.startDate=new Date(r.startDate)),r?.endDate&&(d.endDate=new Date(r.endDate));let l=await a.apiHistoryRepository.count(s,d);return 0===l||l<=n?{items:[],total:l,hasMore:!1}:{items:await a.apiHistoryRepository.findAllWithPagination(s,d,{offset:n,limit:o,orderBy:{createdAt:"desc"}}),total:l,hasMore:n+o<l}}}},1610:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{V:()=>g});var i=a(5145),n=a(9822),o=a.n(n),s=a(5434),d=a(2340),l=a(9179),m=a(3050),p=a(827),c=a(5305),u=a(6555),h=e([d,l,p,u]);[d,l,p,u]=h.then?(await h)():h;let y=(0,s.jl)("AskingResolver");y.level="debug";class g{constructor(){this.getThreadResponseNestedResolver=()=>({view:async(e,t,a)=>{let r=e.viewId;if(!r)return null;let i=await a.viewRepository.findOneBy({id:r}),n=i.properties?JSON.parse(i.properties)?.displayName:i.name;return{...i,displayName:n}},answerDetail:(e,t,a)=>{if(!e?.answerDetail)return null;let{content:r,...i}=e.answerDetail;if(!r)return e.answerDetail;let n=r.replace(/\\n/g,"\n").replace(/\\"/g,'"');return{...i,content:n}},sql:(e,t,a)=>e.breakdownDetail&&e.breakdownDetail.steps?(0,d.Z)((0,l.o5)(e.breakdownDetail.steps)):e.sql?(0,d.Z)(e.sql):null,askingTask:async(e,t,a)=>{if(e.adjustment)return null;let r=a.askingService,i=await r.getAskingTaskById(e.askingTaskId);return i?this.transformAskingTask(i,a):null},adjustmentTask:async(e,t,a)=>{if(!e.adjustment)return null;let r=a.askingService,i=await r.getAdjustmentTaskById(e.askingTaskId);return i?{queryId:i?.queryId,status:i?.status,error:i?.error,sql:i?.response?.[0]?.sql,traceId:i?.traceId,invalidSql:i?.invalidSql?(0,d.Z)(i.invalidSql):null}:null}}),this.getDetailStepNestedResolver=()=>({sql:(e,t,a)=>(0,d.Z)(e.sql)}),this.getResultCandidateNestedResolver=()=>({sql:(e,t,a)=>(0,d.Z)(e.sql),view:async(e,t,a)=>{let r=e.view?.id;if(!r)return e.view;let i=await a.viewRepository.findOneBy({id:r}),n=i.properties?JSON.parse(i.properties).displayName:i.name;return{...e.view,displayName:n}}}),this.createAskingTask=this.createAskingTask.bind(this),this.cancelAskingTask=this.cancelAskingTask.bind(this),this.rerunAskingTask=this.rerunAskingTask.bind(this),this.getAskingTask=this.getAskingTask.bind(this),this.createThread=this.createThread.bind(this),this.getThread=this.getThread.bind(this),this.updateThread=this.updateThread.bind(this),this.deleteThread=this.deleteThread.bind(this),this.listThreads=this.listThreads.bind(this),this.createThreadResponse=this.createThreadResponse.bind(this),this.updateThreadResponse=this.updateThreadResponse.bind(this),this.getResponse=this.getResponse.bind(this),this.previewData=this.previewData.bind(this),this.previewBreakdownData=this.previewBreakdownData.bind(this),this.getSuggestedQuestions=this.getSuggestedQuestions.bind(this),this.createInstantRecommendedQuestions=this.createInstantRecommendedQuestions.bind(this),this.getInstantRecommendedQuestions=this.getInstantRecommendedQuestions.bind(this),this.generateThreadRecommendationQuestions=this.generateThreadRecommendationQuestions.bind(this),this.generateProjectRecommendationQuestions=this.generateProjectRecommendationQuestions.bind(this),this.getThreadRecommendationQuestions=this.getThreadRecommendationQuestions.bind(this),this.generateThreadResponseBreakdown=this.generateThreadResponseBreakdown.bind(this),this.generateThreadResponseAnswer=this.generateThreadResponseAnswer.bind(this),this.generateThreadResponseChart=this.generateThreadResponseChart.bind(this),this.adjustThreadResponseChart=this.adjustThreadResponseChart.bind(this),this.transformAskingTask=this.transformAskingTask.bind(this),this.adjustThreadResponse=this.adjustThreadResponse.bind(this),this.cancelAdjustThreadResponseAnswer=this.cancelAdjustThreadResponseAnswer.bind(this),this.rerunAdjustThreadResponseAnswer=this.rerunAdjustThreadResponseAnswer.bind(this),this.getAdjustmentTask=this.getAdjustmentTask.bind(this)}async recordAskHistory(e,t){try{await e.apiHistoryRepository.createOne({id:(0,u.v4)(),projectId:t.projectId,apiType:c.I.ASK,threadId:String(t.threadId),requestPayload:{question:t.question,source:"ASK_DATA_UI"},responsePayload:{sql:t.sql},statusCode:200,durationMs:Date.now()-t.startTime})}catch(e){y.error(`Failed to record Ask Data API history: ${e.message}`)}}async generateProjectRecommendationQuestions(e,t,a){return await a.projectService.generateProjectRecommendationQuestions(),!0}async generateThreadRecommendationQuestions(e,t,a){let{threadId:r}=t,i=a.askingService;return await i.generateThreadRecommendationQuestions(r),!0}async getThreadRecommendationQuestions(e,t,a){let{threadId:r}=t;return a.askingService.getThreadRecommendationQuestions(r)}async getSuggestedQuestions(e,t,a){let{sampleDataset:r}=await a.projectService.getCurrentProject();return r?{questions:(0,m.cC)(r)}:{questions:[]}}async createAskingTask(e,t,a){let{question:r,threadId:n}=t.data,o=await a.projectService.getCurrentProject(),s=a.askingService,d=await s.createAskingTask({question:r},{threadId:n,language:i.aS[o.language]||i.aS.EN});return a.telemetry.sendEvent(p.MW.HOME_ASK_CANDIDATE,{question:r,taskId:d.id}),d}async cancelAskingTask(e,t,a){let{taskId:r}=t,i=a.askingService;return await i.cancelAskingTask(r),!0}async getAskingTask(e,t,a){let{taskId:r}=t,n=a.askingService,o=await n.getAskingTask(r);if(!o)return null;let s=p.MW.HOME_ASK_CANDIDATE;return o.status===i.i3.FINISHED&&a.telemetry.sendEvent(s,{taskId:r,status:o.status,candidates:o.response}),o.status===i.i3.FAILED&&a.telemetry.sendEvent(s,{taskId:r,status:o.status,error:o.error},p.ic.AI,!1),this.transformAskingTask(o,a)}async createThread(e,t,a){let r;let i=Date.now(),{data:n}=t,o=a.askingService;if(n.taskId){let e=await o.getAskingTask(n.taskId);if(!e)throw Error(`Asking task ${n.taskId} not found`);r={question:e.question,trackedAskingResult:e}}else r=n;let s=p.MW.HOME_CREATE_THREAD;try{let e=await o.createThread(r),t=await a.projectService.getCurrentProject();return await this.recordAskHistory(a,{projectId:t.id,threadId:e.id,question:r.question,sql:r.sql||r.trackedAskingResult?.response?.[0]?.sql,startTime:i}),a.telemetry.sendEvent(s,{}),e}catch(e){throw a.telemetry.sendEvent(s,{error:e.message},e.extensions?.service,!1),e}}async getThread(e,t,a){let{threadId:r}=t,i=a.askingService,n=await i.getResponsesWithThread(r);return o()(n,(e,t)=>(e.id||(e.id=t.threadId,e.sql=t.sql,e.responses=[]),e.responses.push({id:t.id,viewId:t.viewId,threadId:t.threadId,question:t.question,sql:t.sql,askingTaskId:t.askingTaskId,breakdownDetail:t.breakdownDetail,answerDetail:t.answerDetail,chartDetail:t.chartDetail,adjustment:t.adjustment}),e),{})}async updateThread(e,t,a){let{where:r,data:i}=t,n=a.askingService,o=p.MW.HOME_UPDATE_THREAD_SUMMARY,s=i.summary;try{let e=await n.updateThread(r.id,i);return a.telemetry.sendEvent(o,{new_summary:s}),e}catch(e){throw a.telemetry.sendEvent(o,{new_summary:s},e.extensions?.service,!1),e}}async deleteThread(e,t,a){let{where:r}=t,i=a.askingService;return await i.deleteThread(r.id),!0}async listThreads(e,t,a){return await a.askingService.listThreads()}async createThreadResponse(e,t,a){let r;let i=Date.now(),{threadId:n,data:o}=t,s=a.askingService,d=p.MW.HOME_ASK_FOLLOWUP_QUESTION;if(o.taskId){let e=await s.getAskingTask(o.taskId);if(!e)throw Error(`Asking task ${o.taskId} not found`);r={question:e.question,trackedAskingResult:e}}else r=o;try{let e=await s.createThreadResponse(r,n),t=await a.projectService.getCurrentProject();return await this.recordAskHistory(a,{projectId:t.id,threadId:n,question:e.question,sql:e.sql,startTime:i}),a.telemetry.sendEvent(d,{data:o}),e}catch(e){throw a.telemetry.sendEvent(d,{data:o,error:e.message},e.extensions?.service,!1),e}}async updateThreadResponse(e,t,a){let{where:r,data:i}=t,n=a.askingService;return await n.updateThreadResponse(r.id,i)}async rerunAskingTask(e,t,a){let{responseId:r}=t,n=a.askingService,o=await a.projectService.getCurrentProject(),s=await n.rerunAskingTask(r,{language:i.aS[o.language]||i.aS.EN});return a.telemetry.sendEvent(p.MW.HOME_RERUN_ASKING_TASK,{responseId:r}),s}async adjustThreadResponse(e,t,a){let{responseId:r,data:n}=t,o=a.askingService,s=await a.projectService.getCurrentProject();if(n.sql){let e=await o.adjustThreadResponseWithSQL(r,{sql:n.sql});return a.telemetry.sendEvent(p.MW.HOME_ADJUST_THREAD_RESPONSE_WITH_SQL,{sql:n.sql,responseId:r}),e}return o.adjustThreadResponseAnswer(r,{projectId:s.id,tables:n.tables,sqlGenerationReasoning:n.sqlGenerationReasoning},{language:i.aS[s.language]||i.aS.EN})}async cancelAdjustThreadResponseAnswer(e,t,a){let{taskId:r}=t,i=a.askingService;return await i.cancelAdjustThreadResponseAnswer(r),!0}async rerunAdjustThreadResponseAnswer(e,t,a){let{responseId:r}=t,n=a.askingService,o=await a.projectService.getCurrentProject();return await n.rerunAdjustThreadResponseAnswer(r,o.id,{language:i.aS[o.language]||i.aS.EN}),!0}async getAdjustmentTask(e,t,a){let{taskId:r}=t,i=a.askingService,n=await i.getAdjustmentTask(r);return{queryId:n?.queryId,status:n?.status,error:n?.error,sql:n?.response?.[0]?.sql,traceId:n?.traceId,invalidSql:n?.invalidSql?(0,d.Z)(n.invalidSql):null}}async generateThreadResponseBreakdown(e,t,a){let r=await a.projectService.getCurrentProject(),{responseId:n}=t,o=a.askingService;return await o.generateThreadResponseBreakdown(n,{language:i.aS[r.language]||i.aS.EN})}async generateThreadResponseAnswer(e,t,a){let r=await a.projectService.getCurrentProject(),{responseId:n}=t;return a.askingService.generateThreadResponseAnswer(n,{language:i.aS[r.language]||i.aS.EN})}async generateThreadResponseChart(e,t,a){let r=await a.projectService.getCurrentProject(),{responseId:n}=t;return a.askingService.generateThreadResponseChart(n,{language:i.aS[r.language]||i.aS.EN})}async adjustThreadResponseChart(e,t,a){let r=await a.projectService.getCurrentProject(),{responseId:n,data:o}=t;return a.askingService.adjustThreadResponseChart(n,o,{language:i.aS[r.language]||i.aS.EN})}async getResponse(e,t,a){let{responseId:r}=t,i=a.askingService;return await i.getResponse(r)}async previewData(e,t,a){let{responseId:r,limit:i}=t.where,n=a.askingService;return await n.previewData(r,i)}async previewBreakdownData(e,t,a){let{responseId:r,stepIndex:i,limit:n}=t.where,o=a.askingService;return await o.previewBreakdownData(r,i,n)}async createInstantRecommendedQuestions(e,t,a){let{data:r}=t;return a.askingService.createInstantRecommendedQuestions(r)}async getInstantRecommendedQuestions(e,t,a){let{taskId:r}=t,i=a.askingService,n=await i.getInstantRecommendedQuestions(r);return{questions:n.response?.questions||[],status:n.status,error:n.error}}async transformAskingTask(e,t){let a=await Promise.all((e.response||[]).map(async e=>{let a=e.viewId?await t.viewRepository.findOneBy({id:e.viewId}):null,r=e.sqlpairId?await t.sqlPairRepository.findOneBy({id:e.sqlpairId}):null;return{type:e.type,sql:e.sql,view:a,sqlPair:r}}));return{type:e?.status!==i.i3.STOPPED||e.type?e.type:i.dd.TEXT_TO_SQL,status:e.status,error:e.error,candidates:a,queryId:e.queryId,rephrasedQuestion:e.rephrasedQuestion,intentReasoning:e.intentReasoning,sqlGenerationReasoning:e.sqlGenerationReasoning,retrievedTables:e.retrievedTables,invalidSql:e.invalidSql?(0,d.Z)(e.invalidSql):null,traceId:e.traceId}}}r()}catch(e){r(e)}})},1205:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{t:()=>l});var i=a(5145),n=a(3372),o=a(5434),s=e([n]);n=(s.then?(await s)():s)[0];let d=(0,o.jl)("DashboardResolver");d.level="debug";class l{constructor(){this.getDashboard=this.getDashboard.bind(this),this.getDashboardItems=this.getDashboardItems.bind(this),this.createDashboardItem=this.createDashboardItem.bind(this),this.updateDashboardItem=this.updateDashboardItem.bind(this),this.deleteDashboardItem=this.deleteDashboardItem.bind(this),this.updateDashboardItemLayouts=this.updateDashboardItemLayouts.bind(this),this.previewItemSQL=this.previewItemSQL.bind(this),this.setDashboardSchedule=this.setDashboardSchedule.bind(this)}async getDashboard(e,t,a){let r=await a.dashboardService.getCurrentDashboard();if(!r)throw Error("Dashboard not found.");let i=a.dashboardService.parseCronExpression(r),n=await a.dashboardService.getDashboardItems(r.id);return{...r,nextScheduledAt:r.nextScheduledAt?new Date(r.nextScheduledAt).toISOString():null,schedule:i,items:n}}async getDashboardItems(e,t,a){let r=await a.dashboardService.getCurrentDashboard();if(!r)throw Error("Dashboard not found.");return await a.dashboardService.getDashboardItems(r.id)}async createDashboardItem(e,t,a){let{responseId:r,itemType:o}=t.data,s=await a.dashboardService.getCurrentDashboard(),d=await a.askingService.getResponse(r);if(!d)throw Error(`Thread response not found. responseId: ${r}`);if(!Object.keys(i.oX).includes(o))throw Error(`Chart type not supported. responseId: ${r}`);if(!d.chartDetail?.chartSchema)throw Error(`Chart schema not found in thread response. responseId: ${r}`);let l=await a.projectService.getCurrentProject(),m=(await a.deployService.getLastDeployment(l.id)).manifest;return await a.queryService.preview(d.sql,{project:l,manifest:m,limit:n.sf,cacheEnabled:!0,refresh:!0}),await a.dashboardService.createDashboardItem({dashboardId:s.id,type:o,sql:d.sql,chartSchema:d.chartDetail?.chartSchema})}async updateDashboardItem(e,t,a){let{id:r}=t.where,{displayName:i}=t.data;if(!await a.dashboardService.getDashboardItem(r))throw Error(`Dashboard item not found. id: ${r}`);return await a.dashboardService.updateDashboardItem(r,{displayName:i})}async deleteDashboardItem(e,t,a){let{id:r}=t.where;if(!await a.dashboardService.getDashboardItem(r))throw Error(`Dashboard item not found. id: ${r}`);return await a.dashboardService.deleteDashboardItem(r)}async updateDashboardItemLayouts(e,t,a){let{layouts:r}=t.data;if(0===r.length)throw Error("Layouts are required.");return await a.dashboardService.updateDashboardItemLayouts(r)}async previewItemSQL(e,t,a){let{itemId:r,limit:i,refresh:o}=t.data;try{let e=await a.dashboardService.getDashboardItem(r),{cacheEnabled:t}=await a.dashboardService.getCurrentDashboard(),s=await a.projectService.getCurrentProject(),d=(await a.deployService.getLastDeployment(s.id)).manifest,l=await a.queryService.preview(e.detail.sql,{project:s,manifest:d,limit:i||n.sf,cacheEnabled:t,refresh:o||!1}),m=l.data.map(e=>l.columns.reduce((t,a,r)=>(t[a.name]=e[r],t),{}));return{cacheHit:l.cacheHit||!1,cacheCreatedAt:l.cacheCreatedAt||null,cacheOverrodeAt:l.cacheOverrodeAt||null,override:l.override||!1,data:m}}catch(e){throw d.error(`Error previewing SQL item ${r}: ${e}`),e}}async setDashboardSchedule(e,t,a){try{let e=await a.dashboardService.getCurrentDashboard();if(!e)throw Error("Dashboard not found.");return await a.dashboardService.setDashboardSchedule(e.id,t.data)}catch(e){throw d.error(`Failed to set dashboard schedule: ${e.message}`),e}}}r()}catch(e){r(e)}})},1711:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{t:()=>m});var i=a(6555),n=a(3547),o=a(5434),s=a(5716),d=a(3801),l=e([i]);i=(l.then?(await l)():l)[0],(0,o.jl)("DiagramResolver").level="debug";class m{constructor(){this.getDiagram=this.getDiagram.bind(this)}async getDiagram(e,t,a){let r=t.connectionId?await a.projectService.getProjectById(t.connectionId):await a.projectService.getCurrentProject();if(!r)throw Error("Data source not found");let i=a.auth?.user;if(!i?.roles.includes(d.uU.PLATFORM_SUPER_ADMIN)&&(!i?.tenantId||r.tenantId!==i.tenantId))throw Error("Cannot access a data source outside your tenant");let n=await a.modelRepository.findAllBy({projectId:r.id}),o=n.map(e=>e.id),l=await a.modelColumnRepository.findColumnsByModelIds(o),m=await a.modelNestedColumnRepository.findNestedColumnsByModelIds(o),p=await a.relationRepository.findRelationInfoBy({columnIds:l.map(e=>e.id)}),c=await a.viewRepository.findAllBy({projectId:r.id}),u=new s.S({project:r,models:n,columns:l,nestedColumns:m,relations:p,views:c,relatedModels:n,relatedColumns:l,relatedRelations:p}).build();return this.buildDiagram(n,l,m,p,c,u)}buildDiagram(e,t,a,r,i,n){let o=e.map(i=>{let o=this.transformModel(i),s=t.filter(e=>e.modelId===i.id),d=n.models.find(e=>e.name===i.referenceName);return s.forEach(t=>{let n=r.map(e=>[e.fromColumnId,e.toColumnId].includes(t.id)?e:null).filter(e=>!!e);if(n.length>0&&n.forEach(t=>{let a=this.transformModelRelationField({relation:t,currentModel:i,models:e});o.relationFields.push(a)}),t.isCalculated)o.calculatedFields.push(this.transformCalculatedField(t,d.columns));else{let e=a.filter(e=>e.columnId===t.id);o.fields.push(this.transformNormalField(t,e))}}),o}),s=i.map(this.transformView);return{models:o,views:s}}transformModel(e){let t=JSON.parse(e.properties);return{id:(0,i.v4)(),modelId:e.id,nodeType:n.Jq.MODEL,displayName:e.displayName,referenceName:e.referenceName,sourceTableName:e.sourceTableName,refSql:e.refSql,refreshTime:e.refreshTime,cached:e.cached,description:t?.description,fields:[],calculatedFields:[],relationFields:[]}}transformNormalField(e,t){let a=JSON.parse(e.properties);return{id:(0,i.v4)(),columnId:e.id,nodeType:e.isCalculated?n.Jq.CALCULATED_FIELD:n.Jq.FIELD,type:e.type,displayName:e.displayName,referenceName:e.referenceName,description:a?.description,isPrimaryKey:e.isPk,expression:e.aggregation,nestedFields:t.length?t.map(e=>({id:(0,i.v4)(),nestedColumnId:e.id,columnPath:e.columnPath,type:e.type,displayName:e.displayName,referenceName:e.referenceName,description:e.properties?.description})):null}}transformCalculatedField(e,t){let a=JSON.parse(e.properties),r=JSON.parse(e.lineage),o=t.find(({name:t})=>t===e.referenceName);return{id:(0,i.v4)(),columnId:e.id,nodeType:n.Jq.CALCULATED_FIELD,aggregation:e.aggregation,lineage:r,type:e.type,displayName:e.displayName,referenceName:e.referenceName,description:a?.description,isPrimaryKey:e.isPk,expression:o.expression}}transformModelRelationField({relation:e,currentModel:t,models:a}){let r=t.referenceName===e.fromModelName?e.toModelName:e.fromModelName,o=a.find(e=>e.referenceName===r)?.displayName,s=e.properties?JSON.parse(e.properties):null;return{id:(0,i.v4)(),relationId:e.id,nodeType:n.Jq.RELATION,displayName:o,referenceName:r,type:e.joinType,fromModelId:e.fromModelId,fromModelName:e.fromModelName,fromModelDisplayName:e.fromModelDisplayName,fromColumnId:e.fromColumnId,fromColumnName:e.fromColumnName,fromColumnDisplayName:e.fromColumnDisplayName,toModelId:e.toModelId,toModelName:e.toModelName,toModelDisplayName:e.toModelDisplayName,toColumnId:e.toColumnId,toColumnName:e.toColumnName,toColumnDisplayName:e.toColumnDisplayName,description:s?.description}}transformView(e){let t=JSON.parse(e.properties),a=(t?.columns||[]).map(e=>({id:(0,i.v4)(),nodeType:n.Jq.FIELD,type:e.type,displayName:e.name,referenceName:e.name,description:e?.properties?.description}));return{id:(0,i.v4)(),viewId:e.id,nodeType:n.Jq.VIEW,statement:e.statement,referenceName:e.name,displayName:t?.displayName||e.name,fields:a,description:t?.description}}}r()}catch(e){r(e)}})},5285:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{I:()=>l});var i=a(3888),n=a(5434),o=a(827),s=e([o]);o=(s.then?(await s)():s)[0];let d=(0,n.jl)("InstructionResolver");d.level="debug";class l{constructor(){this.getInstructions=this.getInstructions.bind(this),this.createInstruction=this.createInstruction.bind(this),this.updateInstruction=this.updateInstruction.bind(this),this.deleteInstruction=this.deleteInstruction.bind(this)}async getInstructions(e,t,a){try{let e=await a.projectService.getCurrentProject();return await a.instructionService.getInstructions(e.id)}catch(e){throw d.error(`Error getting instructions: ${e}`),e}}async createInstruction(e,t,a){let{instruction:r,questions:i,isDefault:n}=t.data,o=await a.projectService.getCurrentProject();return await a.instructionService.createInstruction({instruction:r,questions:i,isDefault:n,projectId:o.id})}async updateInstruction(e,t,a){let{id:r}=t.where,{instruction:i,questions:n,isDefault:o}=t.data;if(!r)throw Error("Instruction ID is required.");let s=await a.projectService.getCurrentProject();return await a.instructionService.updateInstruction({id:r,projectId:s.id,instruction:i,questions:n,isDefault:o})}async deleteInstruction(e,t,a){let{id:r}=t.where,i=await a.projectService.getCurrentProject();return await a.instructionService.deleteInstruction(r,i.id),!0}}(0,i._)([(0,o.MF)(o.MW.KNOWLEDGE_CREATE_INSTRUCTION)],l.prototype,"createInstruction",null),(0,i._)([(0,o.MF)(o.MW.KNOWLEDGE_UPDATE_INSTRUCTION)],l.prototype,"updateInstruction",null),(0,i._)([(0,o.MF)(o.MW.KNOWLEDGE_DELETE_INSTRUCTION)],l.prototype,"deleteInstruction",null),r()}catch(e){r(e)}})},153:(e,t,a)=>{a.d(t,{p:()=>d});var r=a(2759),i=a(5434);let n=require("lodash/uniq");var o=a.n(n);let s=(0,r.i)();(0,i.jl)("LearingResolver").level="debug";class d{constructor(){this.getLearningRecord=this.getLearningRecord.bind(this),this.saveLearningRecord=this.saveLearningRecord.bind(this)}async getLearningRecord(e,t,a){let r=await a.learningRepository.findAll();return{paths:r[0]?.paths||[]}}async saveLearningRecord(e,t,a){let{path:r}=t.data,i=await a.learningRepository.findAll();if(!i.length)return await a.learningRepository.createOne({userId:s?.userUUID,paths:[r]});let[n]=i;return await a.learningRepository.updateOne(n.id,{userId:s?.userUUID,paths:o()([...n.paths,r])})}}},56:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{G:()=>N});var i,n=a(3547),o=a(5434),s=a(2340),d=a(9699),l=a.n(d),m=a(6069),p=a.n(m),c=a(8467),u=a(9228),h=a(827),y=a(3801),g=e([s,h]);[s,h]=g.then?(await g)():g;let I=(0,o.jl)("ModelResolver");I.level="debug",function(e){e.IN_PROGRESS="IN_PROGRESS",e.SYNCRONIZED="SYNCRONIZED",e.UNSYNCRONIZED="UNSYNCRONIZED"}(i||(i={}));class N{constructor(){this.listModels=this.listModels.bind(this),this.getModel=this.getModel.bind(this),this.createModel=this.createModel.bind(this),this.updateModel=this.updateModel.bind(this),this.deleteModel=this.deleteModel.bind(this),this.updateModelMetadata=this.updateModelMetadata.bind(this),this.deploy=this.deploy.bind(this),this.getMDL=this.getMDL.bind(this),this.checkModelSync=this.checkModelSync.bind(this),this.listViews=this.listViews.bind(this),this.getView=this.getView.bind(this),this.validateView=this.validateView.bind(this),this.createView=this.createView.bind(this),this.deleteView=this.deleteView.bind(this),this.updateViewMetadata=this.updateViewMetadata.bind(this),this.previewModelData=this.previewModelData.bind(this),this.previewViewData=this.previewViewData.bind(this),this.previewSql=this.previewSql.bind(this),this.getNativeSql=this.getNativeSql.bind(this),this.createCalculatedField=this.createCalculatedField.bind(this),this.validateCalculatedField=this.validateCalculatedField.bind(this),this.updateCalculatedField=this.updateCalculatedField.bind(this),this.deleteCalculatedField=this.deleteCalculatedField.bind(this),this.createRelation=this.createRelation.bind(this),this.updateRelation=this.updateRelation.bind(this),this.deleteRelation=this.deleteRelation.bind(this)}async createRelation(e,t,a){let{data:r}=t,i=h.MW.MODELING_CREATE_RELATION;try{let e=await a.modelService.createRelation(r);return a.telemetry.sendEvent(i,{data:r}),e}catch(e){throw a.telemetry.sendEvent(i,{data:r,error:e.message},e.extensions?.service,!1),e}}async updateRelation(e,t,a){let{data:r,where:i}=t,n=h.MW.MODELING_UPDATE_RELATION;try{let e=await a.modelService.updateRelation(r,i.id);return a.telemetry.sendEvent(n,{data:r}),e}catch(e){throw a.telemetry.sendEvent(n,{data:r,error:e.message},e.extensions?.service,!1),e}}async deleteRelation(e,t,a){let r=t.where.id;return await a.modelService.deleteRelation(r),!0}async createCalculatedField(e,t,a){let r=h.MW.MODELING_CREATE_CF;try{let e=await a.modelService.createCalculatedField(t.data);return a.telemetry.sendEvent(r,{data:t.data}),e}catch(e){throw a.telemetry.sendEvent(r,{data:t.data,error:e.message},e.extensions?.service,!1),e}}async validateCalculatedField(e,t,a){let{name:r,modelId:i,columnId:n}=t.data;return await a.modelService.validateCalculatedFieldNaming(r,i,n)}async updateCalculatedField(e,t,a){let{data:r,where:i}=t,n=h.MW.MODELING_UPDATE_CF;try{let e=await a.modelService.updateCalculatedField(r,i.id);return a.telemetry.sendEvent(n,{data:r}),e}catch(e){throw a.telemetry.sendEvent(n,{data:r,error:e.message},e.extensions?.service,!1),e}}async deleteCalculatedField(e,t,a){let r=t.where.id,i=await a.modelColumnRepository.findOneBy({id:r});if(!i||!i.isCalculated)throw Error("Calculated field not found");return await a.modelColumnRepository.deleteOne(r),!0}async checkModelSync(e,t,a){let{id:r}=await a.projectService.getCurrentProject(),{manifest:i}=await a.mdlService.makeCurrentModelMDL(),n=a.deployService.createMDLHash(i,r),o=await a.deployService.getLastDeployment(r),s=o?.hash;return await a.deployService.getInProgressDeployment(r)?{status:"IN_PROGRESS"}:n==s?{status:"SYNCRONIZED"}:{status:"UNSYNCRONIZED"}}async deploy(e,t,a){let r=await a.projectService.getCurrentProject();if(!r.version&&r.type!==n.ri.DUCKDB){let e=await a.projectService.getProjectDataSourceVersion(r);await a.projectService.updateProject(r.id,{version:e})}let{manifest:i}=await a.mdlService.makeCurrentModelMDL(),o=await a.deployService.deploy(i,r.id,t.force);return null===r.sampleDataset&&await a.projectService.generateProjectRecommendationQuestions(),o}async getMDL(e,t,a){let r=await a.deployService.getMDLByHash(t.hash);return{hash:t.hash,mdl:r}}async listModels(e,t,a){let r=t.connectionId?await a.projectService.getProjectById(t.connectionId):await a.projectService.getCurrentProject();if(!r)throw Error("Data source not found");let i=a.auth?.user;if(!i?.roles.includes(y.uU.PLATFORM_SUPER_ADMIN)&&(!i?.tenantId||r.tenantId!==i.tenantId))throw Error("Cannot access a data source outside your tenant");let n=r.id,o=await a.modelRepository.findAllBy({projectId:n}),s=o.map(e=>e.id),d=await a.modelColumnRepository.findColumnsByModelIds(s),l=await a.modelNestedColumnRepository.findNestedColumnsByModelIds(s),m=[];for(let e of o){let t=d.filter(t=>t.modelId===e.id).map(e=>({...e,properties:JSON.parse(e.properties),nestedColumns:e.type.includes("STRUCT")?l.filter(t=>t.columnId===e.id):void 0})),a=t.filter(e=>!e.isCalculated),r=t.filter(e=>e.isCalculated);m.push({...e,fields:a,calculatedFields:r,properties:{...JSON.parse(e.properties)}})}return m}async getModel(e,t,a){let r=t.where.id,i=await a.modelRepository.findOneBy({id:r});if(!i)throw Error("Model not found");let n=await a.modelColumnRepository.findColumnsByModelIds([i.id]),o=await a.modelNestedColumnRepository.findAllBy({modelId:i.id}),s=n.map(e=>({...e,properties:JSON.parse(e.properties),nestedColumns:e.type.includes("STRUCT")?o.filter(t=>t.columnId===e.id):void 0})),d=(await a.relationRepository.findRelationsBy({columnIds:n.map(e=>e.id)})).map(e=>({...e,type:e.joinType,properties:e.properties?JSON.parse(e.properties):{}}));return{...i,fields:s.filter(e=>!e.isCalculated),calculatedFields:s.filter(e=>e.isCalculated),relations:d,properties:{...JSON.parse(i.properties)}}}async createModel(e,t,a){let{sourceTableName:r,fields:i,primaryKey:n}=t.data;try{let e=await this.handleCreateModel(a,r,i,n);return a.telemetry.sendEvent(h.MW.MODELING_CREATE_MODEL,{data:t.data}),e}catch(e){throw a.telemetry.sendEvent(h.MW.MODELING_CREATE_MODEL,{data:t.data,error:e},e.extensions?.service,!1),e}}async handleCreateModel(e,t,a,r){let i=await e.projectService.getCurrentProject(),n=await e.projectService.getProjectDataSourceTables(i);this.validateTableExist(t,n),this.validateColumnsExist(t,a,n);let s=n.find(e=>e.name===t);if(!s)throw Error("Table not found in the data source");let d=s?.properties,l={projectId:i.id,displayName:t,referenceName:(0,u.Ub)(t),sourceTableName:t,cached:!1,refreshTime:null,properties:d?JSON.stringify(d):null},m=await e.modelRepository.createOne(l),p=s.columns.filter(e=>a.includes(e.name)),c=p.map(e=>({modelId:m.id,isCalculated:!1,displayName:e.name,referenceName:(0,o.e3)(e.name),sourceColumnName:e.name,type:e.type||"string",notNull:e.notNull||!1,isPk:r===e.name,properties:e.properties?JSON.stringify(e.properties):null})),h=await e.modelColumnRepository.createMany(c),y=p.flatMap(e=>{let t=h.find(t=>t.sourceColumnName===e.name);return t?(0,u.jC)(e,{modelId:t.modelId,columnId:t.id,sourceColumnName:t.sourceColumnName}):[]});return await e.modelNestedColumnRepository.createMany(y),I.info(`Model created: ${JSON.stringify(m)}`),m}async updateModel(e,t,a){let{fields:r,primaryKey:i}=t.data;try{let e=await this.handleUpdateModel(a,t,r,i);return a.telemetry.sendEvent(h.MW.MODELING_UPDATE_MODEL,{data:t.data}),e}catch(e){throw a.telemetry.sendEvent(h.MW.MODELING_UPDATE_MODEL,{data:t.data,error:e.message},e.extensions?.service,!1),e}}async handleUpdateModel(e,t,a,r){let i=await e.projectService.getCurrentProject(),n=await e.projectService.getProjectDataSourceTables(i),s=await e.modelRepository.findOneBy({id:t.where.id}),d=await e.modelColumnRepository.findAllBy({modelId:s.id,isCalculated:!1}),{sourceTableName:l}=s;this.validateTableExist(l,n),this.validateColumnsExist(l,a,n);let m=n.find(e=>e.name===l)?.columns,{toDeleteColumnIds:p,toCreateColumns:c,toUpdateColumns:h}=(0,u.t8)(a,d,m);if(await (0,u.ND)(e.modelColumnRepository,s.id,r),p.length&&await e.modelColumnRepository.deleteMany(p),c.length){let t=m.filter(e=>c.includes(e.name)),a=t.map(e=>({modelId:s.id,isCalculated:!1,displayName:e.name,sourceColumnName:e.name,referenceName:(0,o.e3)(e.name),type:e.type||"string",notNull:e.notNull,isPk:r===e.name,properties:e.properties?JSON.stringify(e.properties):null})),i=await e.modelColumnRepository.createMany(a),n=t.flatMap(e=>{let t=i.find(t=>t.sourceColumnName===e.name);return(0,u.jC)(e,{modelId:t.modelId,columnId:t.id,sourceColumnName:t.sourceColumnName})});await e.modelNestedColumnRepository.createMany(n)}if(h.length)for(let{id:t,sourceColumnName:a,type:r}of h){let i=await e.modelColumnRepository.updateOne(t,{type:r});if(r.includes("STRUCT")){let t=m.find(e=>e.name===a);await e.modelNestedColumnRepository.deleteAllBy({columnId:i.id}),await e.modelNestedColumnRepository.createMany((0,u.jC)(t,{modelId:i.modelId,columnId:i.id,sourceColumnName:a}))}}return I.info(`Model updated: ${JSON.stringify(s)}`),s}async deleteModel(e,t,a){let r=t.where.id;if(!await a.modelRepository.findOneBy({id:r}))throw Error("Model not found");return await a.modelRepository.deleteOne(r),!0}async updateModelMetadata(e,t,a){let r=t.where.id,i=t.data,n=await a.modelRepository.findOneBy({id:r});if(!n)throw Error("Model not found");let o=h.MW.MODELING_UPDATE_MODEL_METADATA;try{return await this.handleUpdateModelMetadata(i,n,a,r),l()(i.columns)||await this.handleUpdateColumnMetadata(i,a),l()(i.nestedColumns)||await this.handleUpdateNestedColumnMetadata(i,a),l()(i.calculatedFields)||await this.handleUpdateCFMetadata(i,a),l()(i.relationships)||await this.handleUpdateRelationshipMetadata(i,a),a.telemetry.sendEvent(o,{data:i}),!0}catch(e){throw a.telemetry.sendEvent(o,{data:i,error:e.message},e.extensions?.service,!1),e}}async handleUpdateModelMetadata(e,t,a,r){let i={};if(p()(e.displayName)||(i.displayName=this.determineMetadataValue(e.displayName)),!p()(e.description)){let a=p()(t.properties)?{}:JSON.parse(t.properties);a.description=this.determineMetadataValue(e.description),i.properties=JSON.stringify(a)}l()(i)||await a.modelRepository.updateOne(r,i)}async handleUpdateRelationshipMetadata(e,t){let a=e.relationships.map(e=>e.id);for(let r of(await t.relationRepository.findRelationsByIds(a))){let a=e.relationships.find(e=>e.id===r.id),i={};if(!p()(a.description)){let e=r.properties?JSON.parse(r.properties):{};e.description=this.determineMetadataValue(a.description),i.properties=JSON.stringify(e)}l()(i)||await t.relationRepository.updateOne(r.id,i)}}async handleUpdateCFMetadata(e,t){let a=e.calculatedFields.map(e=>e.id);for(let r of(await t.modelColumnRepository.findColumnsByIds(a))){let a=e.calculatedFields.find(e=>e.id===r.id),i={};if(!p()(a.description)){let e=r.properties?JSON.parse(r.properties):{};e.description=this.determineMetadataValue(a.description),i.properties=JSON.stringify(e)}l()(i)||await t.modelColumnRepository.updateOne(r.id,i)}}async handleUpdateColumnMetadata(e,t){let a=e.columns.map(e=>e.id);for(let r of(await t.modelColumnRepository.findColumnsByIds(a))){let a=e.columns.find(e=>e.id===r.id),i={};if(p()(a.displayName)||(i.displayName=this.determineMetadataValue(a.displayName)),!p()(a.description)){let e=r.properties?JSON.parse(r.properties):{};e.description=this.determineMetadataValue(a.description),i.properties=JSON.stringify(e)}l()(i)||await t.modelColumnRepository.updateOne(r.id,i)}}async handleUpdateNestedColumnMetadata(e,t){let a=e.nestedColumns.map(e=>e.id);for(let r of(await t.modelNestedColumnRepository.findNestedColumnsByIds(a))){let a=e.nestedColumns.find(e=>e.id===r.id),i={};p()(a.displayName)||(i.displayName=this.determineMetadataValue(a.displayName)),p()(a.description)||(i.properties={...r.properties,description:this.determineMetadataValue(a.description)}),l()(i)||await t.modelNestedColumnRepository.updateOne(r.id,i)}}async listViews(e,t,a){let{id:r}=await a.projectService.getCurrentProject();return(await a.viewRepository.findAllBy({projectId:r})).map(e=>({...e,displayName:e.properties?JSON.parse(e.properties)?.displayName:e.name}))}async getView(e,t,a){let r=t.where.id,i=await a.viewRepository.findOneBy({id:r});if(!i)throw Error("View not found");let n=i.properties?JSON.parse(i.properties)?.displayName:i.name;return{...i,displayName:n}}async validateView(e,t,a){let{name:r}=t.data;return this.validateViewName(r,a)}async createView(e,t,a){let{name:r,responseId:i,rephrasedQuestion:n}=t.data,o=await this.validateViewName(r,a);if(!o.valid)throw Error(o.message);let d=await a.projectService.getCurrentProject(),{manifest:m}=await a.deployService.getLastDeployment(d.id),p=await a.askingService.getResponse(i);if(!p)throw Error(`Thread response ${i} not found`);let u=(0,s.Z)(p.sql),{columns:y}=await a.queryService.describeStatement(u,{project:d,limit:1,modelingOnly:!1,manifest:m});if(l()(y))throw Error("Failed to describe statement");let g=h.MW.HOME_CREATE_VIEW,I={statement:u,displayName:r};try{let e=(0,c.Z)(r),t=await a.viewRepository.createOne({projectId:d.id,name:e,statement:u,properties:JSON.stringify({displayName:r,columns:y,responseId:i,question:n})});return a.telemetry.sendEvent(g,I),{...t,displayName:r}}catch(e){throw a.telemetry.sendEvent(g,{...I,error:e},e.extensions?.service,!1),e}}async deleteView(e,t,a){let r=t.where.id;if(!await a.viewRepository.findOneBy({id:r}))throw Error("View not found");return await a.viewRepository.deleteOne(r),!0}async previewModelData(e,t,a){let r=t.where.id,i=await a.modelRepository.findOneBy({id:r});if(!i)throw Error("Model not found");let n=await a.projectService.getCurrentProject(),{manifest:o}=await a.mdlService.makeCurrentModelMDL(),s=await a.modelColumnRepository.findColumnsByModelIds([i.id]),d=`select ${(0,u.Yo)(s)} from "${i.referenceName}"`;return await a.queryService.preview(d,{project:n,modelingOnly:!1,manifest:o})}async previewViewData(e,t,a){let{id:r,limit:i}=t.where,n=await a.viewRepository.findOneBy({id:r});if(!n)throw Error("View not found");let{manifest:o}=await a.mdlService.makeCurrentModelMDL(),s=await a.projectService.getCurrentProject();return await a.queryService.preview(n.statement,{project:s,limit:i,manifest:o,modelingOnly:!1})}async previewSql(e,t,a){let{sql:r,projectId:i,limit:n,dryRun:o}=t.data,s=i?await a.projectService.getProjectById(parseInt(i)):await a.projectService.getCurrentProject(),{manifest:d}=await a.deployService.getLastDeployment(s.id);return await a.queryService.preview(r,{project:s,limit:n,modelingOnly:!1,manifest:d,dryRun:o})}async getNativeSql(e,t,a){let r;let{responseId:i}=t,o=await a.projectService.getCurrentProject();if(o.sampleDataset)throw Error("Doesn't support Native SQL");let{manifest:d}=await a.mdlService.makeCurrentModelMDL(),l=await a.askingService.getResponse(i);if(!l)throw Error(`Thread response ${i} not found`);o.type===n.ri.DUCKDB?(I.info("Getting native sql from wren engine"),r=await a.wrenEngineAdaptor.getNativeSQL(l.sql,{manifest:d,modelingOnly:!1})):(I.info("Getting native sql from toolkit engine"),r=await a.ibisServerAdaptor.getNativeSql({dataSource:o.type,sql:l.sql,mdl:d}));let m=o.type===n.ri.MSSQL?"tsql":void 0;return(0,s.Z)(r,{language:m})}async updateViewMetadata(e,t,a){let r=t.where.id,i=t.data,n=await a.viewRepository.findOneBy({id:r});if(!n)throw Error("View not found");let o=JSON.parse(n.properties),s=n.name;if(p()(i.displayName)||(await this.validateViewName(i.displayName,a,r),s=(0,c.Z)(i.displayName),o.displayName=this.determineMetadataValue(i.displayName)),p()(i.description)||(o.description=this.determineMetadataValue(i.description)),!l()(i.columns)){let e=o.columns;for(let t of e){let e=i.columns.find(e=>e.referenceName===t.name);p()(e.description)||(t.properties=t.properties||{},t.properties.description=this.determineMetadataValue(e.description))}o.columns=e}return await a.viewRepository.updateOne(r,{name:s,properties:JSON.stringify(o)}),!0}determineMetadataValue(e){return""===e?null:e}async validateViewName(e,t,a){let{valid:r,message:i}=(0,c.t)(e);if(!r)return{valid:!1,message:i};let n=(0,c.Z)(e),{id:o}=await t.projectService.getCurrentProject();return(await t.viewRepository.findAllBy({projectId:o})).find(e=>e.name===n&&e.id!==a)?{valid:!1,message:`Generated view name "${n}" is duplicated`}:{valid:!0}}validateTableExist(e,t){if(!t.find(t=>t.name===e))throw Error(`Table ${e} not found in the data Source`)}validateColumnsExist(e,t,a){let r=a.find(t=>t.name===e)?.columns;for(let a of t)if(!r.find(e=>e.name===a))throw Error(`Column "${a}" not found in table "${e}" in the data Source`)}}r()}catch(e){r(e)}})},7411:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{D:()=>g});var i,n=a(3547),o=a(5434),s=a(3050),d=a(1131),l=a.n(d),m=a(2305),p=a(8978),c=a(827),u=a(3801),h=e([p,c]);[p,c]=h.then?(await h)():h;let y=(0,o.jl)("DataSourceResolver");y.level="debug",function(e){e.NOT_STARTED="NOT_STARTED",e.DATASOURCE_SAVED="DATASOURCE_SAVED",e.ONBOARDING_FINISHED="ONBOARDING_FINISHED",e.WITH_SAMPLE_DATASET="WITH_SAMPLE_DATASET"}(i||(i={}));class g{constructor(){this.getSettings=this.getSettings.bind(this),this.updateCurrentProject=this.updateCurrentProject.bind(this),this.resetCurrentProject=this.resetCurrentProject.bind(this),this.saveDataSource=this.saveDataSource.bind(this),this.listDataSourceConnections=this.listDataSourceConnections.bind(this),this.switchDataSource=this.switchDataSource.bind(this),this.updateDataSourceConnectionStatus=this.updateDataSourceConnectionStatus.bind(this),this.deleteDataSourceConnection=this.deleteDataSourceConnection.bind(this),this.updateDataSource=this.updateDataSource.bind(this),this.listDataSourceTables=this.listDataSourceTables.bind(this),this.saveTables=this.saveTables.bind(this),this.autoGenerateRelation=this.autoGenerateRelation.bind(this),this.saveRelations=this.saveRelations.bind(this),this.getOnboardingStatus=this.getOnboardingStatus.bind(this),this.startSampleDataset=this.startSampleDataset.bind(this),this.triggerDataSourceDetection=this.triggerDataSourceDetection.bind(this),this.getSchemaChange=this.getSchemaChange.bind(this),this.getProjectRecommendationQuestions=this.getProjectRecommendationQuestions.bind(this)}async getSettings(e,t,a){let r=await a.projectService.getCurrentProject(),i=a.projectService.getGeneralConnectionInfo(r),n=r.type,o=await a.projectRepository.getCurrentTenancyContext();return{productVersion:a.config.wrenProductVersion||"",dataSource:{type:n,properties:{connectionId:r.id,displayName:r.displayName,...i},sampleDataset:r.sampleDataset},language:r.language,tenancy:o}}async getProjectRecommendationQuestions(e,t,a){return a.projectService.getProjectRecommendationQuestions()}async updateCurrentProject(e,t,a){let{language:r}=t.data,i=await a.projectService.getCurrentProject();return await a.projectRepository.updateOne(i.id,{language:r}),null===i.sampleDataset&&await a.projectService.generateProjectRecommendationQuestions(),!0}async resetCurrentProject(e,t,a){let r;try{r=await a.projectService.getCurrentProject()}catch{return!0}let i=c.MW.SETTING_RESET_PROJECT;try{let e=r.id;await a.schemaChangeRepository.deleteAllBy({projectId:e}),await a.deployService.deleteAllByProjectId(e),await a.askingService.deleteAllByProjectId(e),await a.modelService.deleteAllViewsByProjectId(e),await a.modelService.deleteAllModelsByProjectId(e),await a.projectService.deleteProject(e),await a.wrenAIAdaptor.delete(e),a.telemetry.sendEvent(i,{projectId:e,dataSourceType:r.type})}catch(e){throw a.telemetry.sendEvent(i,{dataSourceType:r.type,error:e.message},e.extensions?.service,!1),e}return!0}async startSampleDataset(e,t,a){let{name:r}=t.data,i=s.n5[l()(r)];if(!i)throw Error("Sample dataset not found");if(!(r in s.Y0))throw Error("Invalid sample dataset name");let o=c.MW.CONNECTION_START_SAMPLE_DATASET,d={datasetName:r};try{let t=(0,s.uC)(r);await this.saveDataSource(e,{data:{type:n.ri.DUCKDB,properties:{initSql:t,extensions:[],configurations:{}}}},a);let l=await a.projectService.getCurrentProject(),m=(await this.listDataSourceTables(e,{},a)).map(e=>e.name);await this.overwriteModelsAndColumns(m,a,l),await a.modelService.updatePrimaryKeys(i.tables),await a.modelService.batchUpdateModelProperties(i.tables),await a.modelService.batchUpdateColumnProperties(i.tables);let p=(0,s.H4)(r),c=await a.modelRepository.findAll(),u=await a.modelColumnRepository.findAll(),h=this.buildRelationInput(p,c,u);return await a.modelService.saveRelations(h),await a.projectRepository.updateOne(l.id,{sampleDataset:r}),await this.deploy(a),a.telemetry.sendEvent(o,d),{name:r}}catch(e){throw a.telemetry.sendEvent(o,{...d,error:e.message},e.extensions?.service,!1),e}}async getOnboardingStatus(e,t,a){let r;try{r=await a.projectRepository.getCurrentProject()}catch(e){return{status:"NOT_STARTED"}}let{id:i,sampleDataset:n}=r;return n?{status:"WITH_SAMPLE_DATASET"}:(await a.modelRepository.findAllBy({projectId:i})).length?{status:"ONBOARDING_FINISHED"}:{status:"DATASOURCE_SAVED"}}async saveDataSource(e,t,a){let{type:r,properties:i,tenantId:o,workspaceId:s}=t.data,{displayName:d,...l}=i,m=a.auth?.user,p=m?.roles.includes(u.uU.PLATFORM_SUPER_ADMIN),h=o??m?.tenantId,g=s??m?.workspaceId;if(!h)throw Error("Tenant is required for data source connection");if(!p&&(!m?.tenantId||h!==m.tenantId))throw Error("Cannot create a data source outside your tenant");if(g){let e=await a.projectRepository.findWorkspaceById(g);if(!e||e.tenantId!==h)throw Error("Workspace must belong to the selected tenant")}let I=await a.projectService.createProject({displayName:d,type:r,connectionInfo:l,tenantId:h,workspaceId:g});y.debug("Project created."),y.debug("Dashboard init..."),await a.dashboardService.initDashboard(I.id),y.debug("Dashboard created.");let N=c.MW.CONNECTION_SAVE_DATA_SOURCE,S={dataSourceType:r};try{if(r===n.ri.DUCKDB)await this.buildDuckDbEnvironment(a,{initSql:l.initSql,extensions:l.extensions,configurations:l.configurations});else{let e=await this.registerToolkitProfile(a,I.id,r,I.connectionInfo),t=await a.projectRepository.updateOne(I.id,{toolkitProfileId:e});await a.projectService.getProjectDataSourceTables(t);let i=await a.projectService.getProjectDataSourceVersion(t);y.info(`Datasource metadata verified projectId=${I.id} dataSource=${r} toolkitProfileId=${e} version=${i||"unknown"}`),await a.projectService.updateProject(I.id,{version:i}),y.debug("Data source tables fetched")}a.telemetry.sendEvent(N,S)}catch(e){throw y.error("Failed to get project tables",JSON.stringify(e,null,2)),await a.projectRepository.deleteOne(I.id),a.telemetry.sendEvent(N,{eventProperties:S,error:e.message},e.extensions?.service,!1),e}return{type:I.type,properties:{connectionId:I.id,displayName:I.displayName,...a.projectService.getGeneralConnectionInfo(I)}}}async listDataSourceConnections(e,t,a){let r=a.auth?.user,i=r?.roles.includes(u.uU.PLATFORM_SUPER_ADMIN);return i||r?.tenantId?await a.projectService.listDataSourceConnections(i?null:r?.tenantId):[]}async switchDataSource(e,t,a){let r=a.auth?.user,i=await a.projectService.getProjectById(t.where.id);if(!i)throw Error("Data source not found");if("INACTIVE"===i.status)throw Error("Cannot switch to a disabled data source");if(!r?.roles.includes(u.uU.PLATFORM_SUPER_ADMIN)&&(!r?.tenantId||i.tenantId!==r.tenantId))throw Error("Cannot switch to a data source outside your tenant");return await a.projectService.switchDataSource(i.id),!0}async updateDataSourceConnectionStatus(e,t,a){let r=a.auth?.user,i=await a.projectService.getProjectById(t.where.id);if(!i)throw Error("Data source not found");if(!r?.roles.includes(u.uU.PLATFORM_SUPER_ADMIN)&&(!r?.tenantId||i.tenantId!==r.tenantId))throw Error("Cannot update a data source outside your tenant");let n=t.data.status;if(!["ACTIVE","INACTIVE"].includes(n))throw Error("Invalid data source status");return await a.projectService.setDataSourceConnectionStatus(i.id,n),!0}async deleteDataSourceConnection(e,t,a){let r=a.auth?.user,i=await a.projectService.getProjectById(t.where.id);if(!i)throw Error("Data source not found");if(!r?.roles.includes(u.uU.PLATFORM_SUPER_ADMIN)&&(!r?.tenantId||i.tenantId!==r.tenantId))throw Error("Cannot delete a data source outside your tenant");let n=c.MW.CONNECTION_DELETE_DATA_SOURCE;try{let e=i.id;await a.projectService.setDataSourceConnectionStatus(e,"INACTIVE"),await a.schemaChangeRepository.deleteAllBy({projectId:e}),await a.deployService.deleteAllByProjectId(e),await a.askingService.deleteAllByProjectId(e),await a.modelService.deleteAllViewsByProjectId(e),await a.modelService.deleteAllModelsByProjectId(e),await a.projectService.deleteProject(e),await a.wrenAIAdaptor.delete(e),a.telemetry.sendEvent(n,{projectId:e,dataSourceType:i.type})}catch(e){throw a.telemetry.sendEvent(n,{dataSourceType:i.type,error:e.message},e.extensions?.service,!1),e}return!0}async updateDataSource(e,t,a){let r;let{properties:i}=t.data,{displayName:o,...s}=i,d=await a.projectService.getCurrentProject(),l=d.type,m=(0,p.uZ)(l,s);if(l===n.ri.DUCKDB){let{initSql:e,extensions:t,configurations:r}=m;await this.buildDuckDbEnvironment(a,{initSql:e,extensions:t,configurations:r})}else{r=await this.registerToolkitProfile(a,d.id,l,m);let e={...d,displayName:o,toolkitProfileId:r,connectionInfo:{...d.connectionInfo,...m}};await a.projectService.getProjectDataSourceTables(e),y.info(`Datasource metadata verified projectId=${d.id} dataSource=${l} toolkitProfileId=${r}`),y.debug("Data source tables fetched")}let c=await a.projectRepository.updateOne(d.id,{displayName:o,...l===n.ri.DUCKDB?{}:{toolkitProfileId:r},connectionInfo:{...d.connectionInfo,...m}});return{type:c.type,properties:{displayName:c.displayName,...a.projectService.getGeneralConnectionInfo(c)}}}async registerToolkitProfile(e,t,a,r){let i=`wren-ui-project-${t}`;return y.info(`Toolkit profile registration requested projectId=${t} dataSource=${a} profileId=${i}`),await e.ibisServerAdaptor.registerProfile(i,a,r),y.info(`Toolkit profile registered projectId=${t} dataSource=${a} profileId=${i} storage=wren_ui_metadata.toolkit_profiles`),i}async listDataSourceTables(e,t,a){let r=await this.getSetupProject(a,t.connectionId);return await a.projectService.getProjectDataSourceTables(r)}async saveTables(e,t,a){let r=c.MW.CONNECTION_SAVE_TABLES,i=await this.getSetupProject(a,t.data.connectionId);try{let{models:e,columns:n}=await this.overwriteModelsAndColumns(t.data.tables,a,i);return a.telemetry.sendEvent(r,{dataSourceType:i.type,tablesCount:e.length,columnsCount:n.length}),this.deploy(a,i),{models:e,columns:n}}catch(e){throw a.telemetry.sendEvent(r,{dataSourceType:i.type,error:e.message},e.extensions?.service,!1),e}}async autoGenerateRelation(e,t,a){let r=await this.getSetupProject(a,t.connectionId),i=await a.modelRepository.findAllBy({projectId:r.id}),o=i.map(e=>e.id),s=await a.modelColumnRepository.findColumnsByModelIds(o),d=await a.projectService.getProjectSuggestedConstraint(r);y.info(`Relationship recommendation input projectId=${r.id} models=${i.length} columns=${s.length} constraints=${d.length}`);let l=[];for(let e of d){let{constraintTable:t,constraintColumn:a,constraintedTable:r,constraintedColumn:o}=e,d=i.find(e=>e.sourceTableName===t),m=i.find(e=>e.sourceTableName===r);if(!d||!m)continue;let p=s.find(e=>e.modelId===d.id&&e.sourceColumnName===a),c=s.find(e=>e.modelId===m.id&&e.sourceColumnName===o);if(!p||!c)continue;let u={name:e.constraintName,fromModelId:d.id,fromModelReferenceName:d.referenceName,fromColumnId:p.id,fromColumnReferenceName:p.referenceName,toModelId:m.id,toModelReferenceName:m.referenceName,toColumnId:c.id,toColumnReferenceName:c.referenceName,type:n.uT.ONE_TO_MANY};l.push(u)}return y.info(`Relationship recommendation generated projectId=${r.id} relations=${l.length}`),i.map(({id:e,displayName:t,referenceName:a})=>({id:e,displayName:t,referenceName:a,relations:l.filter(t=>t.fromModelId===e&&t.toModelId!==t.fromModelId)}))}async saveRelations(e,t,a){let r=c.MW.CONNECTION_SAVE_RELATION;try{let e=await this.getSetupProject(a,t.data.connectionId),i=await a.modelService.saveRelations(t.data.relations,e.id);return this.deploy(a,e),a.telemetry.sendEvent(r,{relationCount:i.length}),i}catch(e){throw a.telemetry.sendEvent(r,{error:e.message},e.extensions?.service,!1),e}}async getSchemaChange(e,t,a){let r=await a.projectService.getCurrentProject(),i=await a.schemaChangeRepository.findLastSchemaChange(r.id);if(!i)return{deletedTables:null,deletedColumns:null,modifiedColumns:null,lastSchemaChangeTime:null};let n=await a.modelRepository.findAllBy({projectId:r.id}),o=n.map(e=>e.id),s=await a.modelColumnRepository.findColumnsByModelIds(o),d=await a.relationRepository.findRelationInfoBy({modelIds:o}),l=new m.Z({ctx:a,projectId:r.id}),p=i.resolve;return{...Object.keys(p).reduce((e,t)=>{let a=p[t],r=i.change[t];if(a||!r)return e;let o=l.getAffectedResources(r,{models:n,modelColumns:s,modelRelationships:d}),m=o.length?o:null;return{...e,[t]:m}},{}),lastSchemaChangeTime:i.createdAt}}async triggerDataSourceDetection(e,t,a){let r=await a.projectService.getCurrentProject(),i=new m.Z({ctx:a,projectId:r.id}),n=c.MW.MODELING_DETECT_SCHEMA_CHANGE;try{let e=await i.detectSchemaChange();return a.telemetry.sendEvent(n,{hasSchemaChange:e}),e}catch(e){throw a.telemetry.sendEvent(n,{error:e},e.extensions?.service,!1),e}}async resolveSchemaChange(e,t,a){let{type:r}=t.where,i=await a.projectService.getCurrentProject(),n=new m.Z({ctx:a,projectId:i.id}),o=c.MW.MODELING_RESOLVE_SCHEMA_CHANGE;try{await n.resolveSchemaChange(r),a.telemetry.sendEvent(o,{type:r})}catch(e){throw a.telemetry.sendEvent(o,{type:r,error:e},e.extensions?.service,!1),e}return!0}async deploy(e,t){let a=t||await e.projectService.getCurrentProject(),{manifest:r}=await e.mdlService.makeCurrentModelMDL(a),i=await e.deployService.deploy(r,a.id);return null===a.sampleDataset&&await e.projectService.generateProjectRecommendationQuestions(a.id),i}async getSetupProject(e,t){let a=t?await e.projectService.getProjectById(t):await e.projectService.getCurrentProject();if(!a)throw Error("Data source not found");let r=e.auth?.user;if(!r?.roles.includes(u.uU.PLATFORM_SUPER_ADMIN)&&(!r?.tenantId||a.tenantId!==r.tenantId))throw Error("Cannot access a data source outside your tenant");if("INACTIVE"===a.status)throw Error("Cannot configure a disabled data source");return a}buildRelationInput(e,t,a){return e.map(e=>{let{fromModelName:r,fromColumnName:i,toModelName:n,toColumnName:o,type:s}=e,d=t.find(e=>e.sourceTableName===r)?.id,l=t.find(e=>e.sourceTableName===n)?.id;if(!d||!l)throw Error(`Model not found, fromModelName "${r}" to toModelName: "${n}"`);let m=a.find(e=>e.referenceName===i&&e.modelId===d)?.id,p=a.find(e=>e.referenceName===o&&e.modelId===l)?.id;if(!m||!p)throw Error(`Column not found fromColumnName: ${i} toColumnName: ${o}`);return{fromModelId:d,fromColumnId:m,toModelId:l,toColumnId:p,type:s,description:e.description}})}async overwriteModelsAndColumns(e,t,a){await t.modelService.deleteAllModelsByProjectId(a.id);let r=await t.projectService.getProjectDataSourceTables(a);y.info(`Datasource tables loaded for model overwrite projectId=${a.id} availableTables=${r.length} selectedTables=${e.length}`);let i=r.filter(t=>e.includes(t.name));y.info(`Persisting selected datasource tables projectId=${a.id} matchedTables=${i.length} storage=model,model_column,model_nested_column`);let n=i.map(e=>{let t=e?.properties;return{projectId:a.id,displayName:e.name,referenceName:(0,o.Ub)(e.name),sourceTableName:e.name,cached:!1,refreshTime:null,properties:t?JSON.stringify(t):null}}),s=await t.modelRepository.createMany(n);y.info(`Models persisted projectId=${a.id} models=${s.length} storage=model`);let d=i.flatMap(e=>{let t=e.columns,a=e.primaryKey,r=s.find(t=>t.sourceTableName===e.name);return t.map(e=>({modelId:r.id,isCalculated:!1,displayName:e.name,referenceName:(0,o.e3)(e.name),sourceColumnName:e.name,type:e.type||"string",notNull:e.notNull||!1,isPk:a===e.name,properties:e.properties?JSON.stringify(e.properties):null}))}),l=await t.modelColumnRepository.createMany(d);y.info(`Columns persisted projectId=${a.id} columns=${l.length} storage=model_column`);let m=i.flatMap(e=>e.columns).flatMap(e=>{let t=l.find(t=>t.sourceColumnName===e.name);return(0,o.jC)(e,{modelId:t.modelId,columnId:t.id,sourceColumnName:t.sourceColumnName})});return await t.modelNestedColumnRepository.createMany(m),y.info(`Nested columns persisted projectId=${a.id} nestedColumns=${m.length} storage=model_nested_column`),{models:s,columns:l}}concatInitSql(e,t){let a=t.map(e=>`INSTALL ${e};`).join("\n");return(0,o.fy)(`${a}
${e}`)}async buildDuckDbEnvironment(e,t){let{initSql:a,extensions:r,configurations:i}=t,n=this.concatInitSql(a,r);await e.wrenEngineAdaptor.prepareDuckDB({sessionProps:i,initSql:n}),await e.wrenEngineAdaptor.listTables(),await e.wrenEngineAdaptor.patchConfig({"wren.datasource.type":"duckdb"})}}r()}catch(e){r(e)}})},568:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{q:()=>l});var i=a(3888),n=a(4634),o=a(827),s=a(2340),d=e([o,s]);[o,s]=d.then?(await d)():d;class l{constructor(){this.getSqlPairNestedResolver=()=>({createdAt:(e,t,a)=>new Date(e.createdAt).toISOString(),updatedAt:(e,t,a)=>new Date(e.updatedAt).toISOString()}),this.getProjectSqlPairs=this.getProjectSqlPairs.bind(this),this.createSqlPair=this.createSqlPair.bind(this),this.updateSqlPair=this.updateSqlPair.bind(this),this.deleteSqlPair=this.deleteSqlPair.bind(this),this.generateQuestion=this.generateQuestion.bind(this),this.modelSubstitute=this.modelSubstitute.bind(this)}async getProjectSqlPairs(e,t,a){let r=await a.projectService.getCurrentProject();return a.sqlPairService.getProjectSqlPairs(r.id)}async createSqlPair(e,t,a){let r=await a.projectService.getCurrentProject();return await this.validateSql(t.data.sql,a),await a.sqlPairService.createSqlPair(r.id,t.data)}async updateSqlPair(e,t,a){let r=await a.projectService.getCurrentProject();return await this.validateSql(t.data.sql,a),a.sqlPairService.editSqlPair(r.id,t.where.id,t.data)}async deleteSqlPair(e,t,a){let r=await a.projectService.getCurrentProject();return a.sqlPairService.deleteSqlPair(r.id,t.where.id)}async generateQuestion(e,t,a){let r=await a.projectService.getCurrentProject();return(await a.sqlPairService.generateQuestions(r,[t.data.sql]))[0]}async modelSubstitute(e,t,a){let r=await a.projectService.getCurrentProject(),i=(await a.deployService.getLastDeployment(r.id)).manifest,n=await a.sqlPairService.modelSubstitute(t.data.sql,{project:r,manifest:i});return(0,s.Z)(n,{language:"postgresql"})}async validateSql(e,t){let a=await t.projectService.getCurrentProject(),r=(await t.deployService.getLastDeployment(a.id)).manifest;try{await t.queryService.preview(e,{manifest:r,project:a,dryRun:!0})}catch(e){throw n.Ue(n.GL.INVALID_SQL_ERROR,{customMessage:e.message})}}}(0,i._)([(0,o.MF)(o.MW.KNOWLEDGE_CREATE_SQL_PAIR)],l.prototype,"createSqlPair",null),(0,i._)([(0,o.MF)(o.MW.KNOWLEDGE_UPDATE_SQL_PAIR)],l.prototype,"updateSqlPair",null),(0,i._)([(0,o.MF)(o.MW.KNOWLEDGE_DELETE_SQL_PAIR)],l.prototype,"deleteSqlPair",null),r()}catch(e){r(e)}})},3642:(e,t,a)=>{a.d(t,{m:()=>r});let r=new(a(7343)).GraphQLScalarType({name:"DialectSQL",description:"A string representing a SQL query in a specific dialect",serialize(e){if("string"!=typeof e)throw Error("DialectSQL must be a string");return e},parseValue(e){if("string"!=typeof e)throw Error("DialectSQL must be a string");return e},parseLiteral(e){if("StringValue"!==e.kind)throw Error("DialectSQL must be a string");return e.value}})},3189:(e,t,a)=>{a.d(t,{U:()=>i});var r=a(6352);let i=(0,r.gql)`
  scalar JSON
  scalar DialectSQL

  enum ApiType {
    GENERATE_SQL
    RUN_SQL
    GENERATE_VEGA_CHART
    GENERATE_SUMMARY
    ASK
    GET_INSTRUCTIONS
    CREATE_INSTRUCTION
    UPDATE_INSTRUCTION
    DELETE_INSTRUCTION
    CREATE_SQL_PAIR
    UPDATE_SQL_PAIR
    DELETE_SQL_PAIR
    GET_SQL_PAIRS
    GET_MODELS
    STREAM_ASK
    STREAM_GENERATE_SQL
  }

  input ApiHistoryFilterInput {
    apiType: ApiType
    statusCode: Int
    threadId: String
    projectId: Int
    startDate: String
    endDate: String
  }

  input ApiHistoryPaginationInput {
    offset: Int!
    limit: Int!
  }

  type ApiHistoryResponse {
    id: String!
    projectId: Int!
    apiType: ApiType!
    threadId: String
    headers: JSON
    requestPayload: JSON
    responsePayload: JSON
    statusCode: Int
    durationMs: Int
    createdAt: String!
    updatedAt: String!
  }

  type ApiHistoryPaginatedResponse {
    items: [ApiHistoryResponse!]!
    total: Int!
    hasMore: Boolean!
  }

  enum DataSourceName {
    ATHENA
    BIG_QUERY
    DUCKDB
    POSTGRES
    MYSQL
    ORACLE
    MSSQL
    CLICK_HOUSE
    TRINO
    SNOWFLAKE
    REDSHIFT
    DATABRICKS
  }

  enum RedshiftConnectionType {
    redshift
    redshift_iam
  }

  enum DatabricksConnectionType {
    token
    service_principal
  }

  enum ExpressionName {
    ABS
    AVG
    COUNT
    COUNT_IF
    MAX
    MIN
    SUM
    CBRT
    CEIL
    CEILING
    EXP
    FLOOR
    LN
    LOG10
    ROUND
    SIGN
    LENGTH
    REVERSE
  }

  enum SampleDatasetName {
    HR
    ECOMMERCE
    NBA
    MUSIC
  }

  enum SyncStatus {
    IN_PROGRESS
    SYNCRONIZED
    UNSYNCRONIZED
  }

  enum SchemaChangeType {
    DELETED_TABLES
    DELETED_COLUMNS
    MODIFIED_COLUMNS
  }

  enum ProjectLanguage {
    EN
    ES
    FR
    ZH_TW
    ZH_CN
    DE
    PT
    RU
    JA
    KO
    IT
    FA_IR
    AR
    NL
    AZ_AZ
    TR
  }

  type DataSource {
    type: DataSourceName!
    properties: JSON!
    # Show the name if the data source setup comes from a sample
    sampleDataset: SampleDatasetName
  }

  type DataSourceConnection {
    id: Int!
    displayName: String
    type: DataSourceName!
    tenantId: Int
    tenantName: String
    workspaceId: Int
    workspaceName: String
    status: String!
    isDefault: Boolean!
    createdAt: String
    updatedAt: String
  }

  input WhereIdInput {
    id: Int!
  }

  input UpdateDataSourceConnectionStatusInput {
    status: String!
  }

  input DataSourceInput {
    type: DataSourceName!
    properties: JSON!
    tenantId: Int
    workspaceId: Int
  }

  input SampleDatasetInput {
    name: SampleDatasetName!
  }

  type CompactTable {
    name: String!
    columns: [CompactColumn!]!
    properties: JSON
  }

  input MDLModelSubmitInput {
    name: String!
    columns: [String!]!
  }

  enum RelationType {
    ONE_TO_ONE
    ONE_TO_MANY
    MANY_TO_ONE
  }

  enum OnboardingStatus {
    NOT_STARTED
    DATASOURCE_SAVED
    ONBOARDING_FINISHED
    WITH_SAMPLE_DATASET
  }

  enum NodeType {
    MODEL
    METRIC
    VIEW
    RELATION
    FIELD
    CALCULATED_FIELD
  }

  type Relation {
    fromModelId: Int!
    fromModelReferenceName: String!
    fromColumnId: Int!
    fromColumnReferenceName: String!
    toModelId: Int!
    toModelReferenceName: String!
    toColumnId: Int!
    toColumnReferenceName: String!
    type: RelationType!
    name: String!
  }

  type RecommendRelations {
    id: Int!
    displayName: String!
    referenceName: String!
    relations: [Relation]!
  }

  input RelationInput {
    fromModelId: Int!
    fromColumnId: Int!
    toModelId: Int!
    toColumnId: Int!
    type: RelationType!
  }

  input UpdateRelationInput {
    type: RelationType!
  }

  input SaveRelationInput {
    relations: [RelationInput]!
    connectionId: Int
  }

  input SaveTablesInput {
    tables: [String!]!
    connectionId: Int
  }

  type CompactColumn {
    name: String!
    type: String!
    properties: JSON
  }

  input CustomFieldInput {
    name: String!
    expression: String!
  }

  input CalculatedFieldInput {
    name: String!
    expression: String!
    lineage: [Int!]!
    diagram: JSON
  }

  input CreateModelInput {
    sourceTableName: String!
    fields: [String!]!
    primaryKey: String
  }

  input CreateCalculatedFieldInput {
    modelId: Int!
    name: String!
    expression: ExpressionName!
    lineage: [Int!]!
  }

  input UpdateCalculatedFieldInput {
    name: String!
    expression: ExpressionName!
    lineage: [Int!]!
  }

  input UpdateCalculatedFieldWhere {
    id: Int!
  }

  input ValidateCalculatedFieldInput {
    name: String!
    modelId: Int!
    columnId: Int
  }

  type CalculatedFieldValidationResponse {
    valid: Boolean!
    message: String
  }

  input ModelWhereInput {
    id: Int!
  }

  input UpdateModelInput {
    fields: [String!]!
    primaryKey: String
  }

  # Metadata related
  input UpdateNestedColumnMetadataInput {
    id: Int!
    displayName: String
    description: String
  }

  input UpdateColumnMetadataInput {
    id: Int!
    displayName: String
    description: String
  }

  input UpdateCalculatedFieldMetadataInput {
    id: Int!
    description: String
  }

  input UpdateRelationshipMetadataInput {
    id: Int!
    description: String
  }

  input UpdateViewColumnMetadataInput {
    referenceName: String!
    description: String
  }

  input UpdateModelMetadataInput {
    displayName: String # Model display name, i,e, the alias of the model
    description: String # Model description
    columns: [UpdateColumnMetadataInput!] # Update column metadata
    nestedColumns: [UpdateNestedColumnMetadataInput!] # Update nested column metadata
    calculatedFields: [UpdateCalculatedFieldMetadataInput!] # Update calculated field metadata
    relationships: [UpdateRelationshipMetadataInput!] # Update relationship metadata
  }

  input UpdateViewMetadataInput {
    displayName: String # View display name, i,e, the alias of the view
    description: String # View description
    columns: [UpdateViewColumnMetadataInput!]
  }

  type NestedFieldInfo {
    id: Int!
    displayName: String!
    referenceName: String!
    sourceColumnName: String!
    columnPath: [String!]!
    type: String!
    properties: JSON!
  }

  type FieldInfo {
    id: Int!
    displayName: String!
    referenceName: String!
    sourceColumnName: String!
    type: String
    isCalculated: Boolean!
    notNull: Boolean!
    expression: String
    properties: JSON
    nestedColumns: [NestedFieldInfo!]
  }

  type ModelInfo {
    id: Int!
    displayName: String!
    referenceName: String!
    sourceTableName: String!
    refSql: String
    primaryKey: String
    cached: Boolean!
    refreshTime: String
    description: String
    fields: [FieldInfo]!
    calculatedFields: [FieldInfo]!
    properties: JSON
  }

  type DetailedNestedColumn {
    id: Int!
    displayName: String!
    referenceName: String!
    sourceColumnName: String!
    columnPath: [String!]!
    type: String
    properties: JSON
  }

  type DetailedColumn {
    displayName: String!
    referenceName: String!
    sourceColumnName: String!
    type: String
    isCalculated: Boolean!
    notNull: Boolean!
    properties: JSON!
    nestedColumns: [DetailedNestedColumn!]
  }

  type DetailedRelation {
    fromModelId: Int!
    fromColumnId: Int!
    toModelId: Int!
    toColumnId: Int!
    type: RelationType!
    name: String!
    properties: JSON!
  }

  type DetailedModel {
    displayName: String!
    referenceName: String!
    sourceTableName: String!
    refSql: String!
    primaryKey: String
    cached: Boolean!
    refreshTime: String
    description: String
    fields: [DetailedColumn]
    calculatedFields: [DetailedColumn]
    relations: [DetailedRelation]
    properties: JSON!
  }

  # View
  type ViewInfo {
    id: Int!
    name: String!
    statement: String!
    displayName: String!
  }

  input ViewWhereUniqueInput {
    id: Int!
  }

  input PreviewViewDataInput {
    id: Int!
    # It will return default 500 rows if not specified limit
    # refer: DEFAULT_PREVIEW_LIMIT
    limit: Int
  }

  input CreateViewInput {
    name: String!
    responseId: Int!
    rephrasedQuestion: String!
  }

  input ValidateViewInput {
    name: String!
  }

  type ViewValidationResponse {
    valid: Boolean!
    message: String
  }

  # onboarding
  type OnboardingStatusResponse {
    status: OnboardingStatus
  }

  type ModelSyncResponse {
    status: SyncStatus!
  }

  type Diagram {
    models: [DiagramModel]!
    views: [DiagramView]!
  }

  type DiagramView {
    id: String!
    viewId: Int!
    nodeType: NodeType!
    statement: String!
    displayName: String!
    referenceName: String!
    fields: [DiagramViewField]!
    description: String
  }

  type DiagramViewField {
    id: String!
    displayName: String!
    referenceName: String!
    type: String!
    nodeType: NodeType!
    description: String
  }

  type DiagramModel {
    id: String!
    modelId: Int!
    nodeType: NodeType!
    displayName: String!
    referenceName: String!
    sourceTableName: String!
    refSql: String
    cached: Boolean!
    refreshTime: String
    description: String
    fields: [DiagramModelField]!
    calculatedFields: [DiagramModelField]!
    relationFields: [DiagramModelRelationField]!
  }

  type DiagramModelNestedField {
    id: String!
    nestedColumnId: Int!
    displayName: String!
    referenceName: String!
    columnPath: [String!]!
    type: String!
    description: String
  }

  type DiagramModelField {
    id: String!
    columnId: Int!
    nodeType: NodeType!
    type: String!
    displayName: String!
    referenceName: String!
    description: String
    isPrimaryKey: Boolean!
    expression: String
    aggregation: String
    lineage: [Int!]
    nestedFields: [DiagramModelNestedField!]
  }

  type DiagramModelRelationField {
    id: String!
    relationId: Int!
    nodeType: NodeType!
    type: RelationType!
    displayName: String!
    referenceName: String!
    description: String
    fromModelId: Int!
    fromModelName: String!
    fromModelDisplayName: String!
    fromColumnId: Int!
    fromColumnName: String!
    fromColumnDisplayName: String!
    toModelId: Int!
    toModelName: String!
    toModelDisplayName: String!
    toColumnId: Int!
    toColumnName: String!
    toColumnDisplayName: String!
  }

  input SimpleMeasureInput {
    name: String!
    type: String!
    isCalculated: Boolean!
    notNull: Boolean!
    properties: JSON!
  }

  input DimensionInput {
    name: String!
    type: String!
    isCalculated: Boolean!
    notNull: Boolean!
    properties: JSON!
  }

  input TimeGrainInput {
    name: String!
    refColumn: String!
    dateParts: [String!]!
  }

  input CreateSimpleMetricInput {
    name: String!
    displayName: String!
    description: String
    cached: Boolean!
    refreshTime: String
    model: String!
    properties: JSON!
    measure: [SimpleMeasureInput!]!
    dimension: [DimensionInput!]!
    timeGrain: [TimeGrainInput!]!
  }

  # Task
  type Task {
    id: String!
  }

  # Error
  type Error {
    code: String
    shortMessage: String
    message: String
    stacktrace: [String]
  }

  # Asking Task
  input AskingTaskInput {
    question: String!
    # Used for follow-up questions
    threadId: Int
  }

  enum AskingTaskStatus {
    UNDERSTANDING
    SEARCHING
    PLANNING
    GENERATING
    CORRECTING
    FINISHED
    FAILED
    STOPPED
  }

  enum AskingTaskType {
    GENERAL
    TEXT_TO_SQL
    MISLEADING_QUERY
  }

  enum ChartTaskStatus {
    FETCHING
    GENERATING
    FINISHED
    FAILED
    STOPPED
  }

  enum ChartType {
    BAR
    PIE
    LINE
    MULTI_LINE
    AREA
    GROUPED_BAR
    STACKED_BAR
  }

  enum ResultCandidateType {
    VIEW # View type candidate is provided basd on a saved view
    LLM # LLM type candidate is created by LLM
    SQL_PAIR # SQL pair type candidate is created by SQL pair
  }

  type ResultCandidate {
    type: ResultCandidateType!
    sql: String!
    view: ViewInfo
    sqlPair: SqlPair
  }

  type AskingTask {
    status: AskingTaskStatus!
    type: AskingTaskType
    error: Error
    candidates: [ResultCandidate!]!
    rephrasedQuestion: String
    intentReasoning: String
    sqlGenerationReasoning: String
    retrievedTables: [String!]
    invalidSql: String
    traceId: String
    queryId: String
  }

  input InstantRecommendedQuestionsInput {
    previousQuestions: [String!]
  }

  enum RecommendedQuestionsTaskStatus {
    NOT_STARTED
    GENERATING
    FINISHED
    FAILED
  }

  type ResultQuestion {
    question: String!
    category: String!
    sql: String!
  }

  type RecommendedQuestionsTask {
    status: RecommendedQuestionsTaskStatus!
    questions: [ResultQuestion!]!
    error: Error
  }

  # Thread
  input CreateThreadInput {
    question: String
    sql: String
    taskId: String
  }

  input CreateThreadResponseInput {
    question: String
    sql: String
    taskId: String
  }

  input ThreadUniqueWhereInput {
    id: Int!
  }

  input UpdateThreadInput {
    summary: String
  }

  input ThreadResponseUniqueWhereInput {
    id: Int!
  }

  input UpdateThreadResponseInput {
    sql: String
  }

  input AdjustThreadResponseChartInput {
    chartType: ChartType!
    xAxis: String
    yAxis: String
    xOffset: String
    color: String
    theta: String
  }

  input AdjustThreadResponseInput {
    tables: [String!]
    sqlGenerationReasoning: String
    sql: String
  }

  input PreviewDataInput {
    responseId: Int!
    # Optional, only used for preview data of a single step
    stepIndex: Int
    # It will return default 500 rows if not specified limit
    # refer: DEFAULT_PREVIEW_LIMIT
    limit: Int
  }

  type DetailStep {
    summary: String!
    sql: String!
    cteName: String
  }

  enum ThreadResponseAnswerStatus {
    NOT_STARTED
    FETCHING_DATA
    PREPROCESSING
    STREAMING
    FINISHED
    FAILED
    INTERRUPTED
  }

  type ThreadResponseAnswerDetail {
    queryId: String
    status: ThreadResponseAnswerStatus
    error: Error
    numRowsUsedInLLM: Int
    content: String
  }

  type ThreadResponseBreakdownDetail {
    queryId: String
    status: AskingTaskStatus!
    error: Error
    description: String
    steps: [DetailStep!]
  }

  type ThreadResponseChartDetail {
    queryId: String
    status: ChartTaskStatus!
    error: Error
    description: String
    chartType: ChartType
    chartSchema: JSON
    adjustment: Boolean
  }

  enum ThreadResponseAdjustmentType {
    REASONING
    APPLY_SQL
  }

  type ThreadResponseAdjustment {
    type: ThreadResponseAdjustmentType!
    payload: JSON
  }

  type AdjustmentTask {
    queryId: String
    status: AskingTaskStatus
    error: Error
    sql: String
    traceId: String
    invalidSql: String
  }

  type ThreadResponse {
    id: Int!
    threadId: Int!
    question: String!
    sql: String
    view: ViewInfo
    breakdownDetail: ThreadResponseBreakdownDetail
    answerDetail: ThreadResponseAnswerDetail
    chartDetail: ThreadResponseChartDetail
    askingTask: AskingTask
    adjustment: ThreadResponseAdjustment
    adjustmentTask: AdjustmentTask
  }

  # Thread only consists of basic information of a thread
  type Thread {
    id: Int!
    summary: String!
  }

  # Detailed thread consists of thread and thread responses
  type DetailedThread {
    id: Int!
    responses: [ThreadResponse!]!
  }

  type SuggestedQuestion {
    question: String!
    label: String!
  }
  # Ask Questions Responses
  type SuggestedQuestionResponse {
    questions: [SuggestedQuestion]!
  }

  # Settings
  input UpdateDataSourceInput {
    properties: JSON!
  }

  input UpdateCurrentProjectInput {
    language: ProjectLanguage!
  }

  type Settings {
    productVersion: String!
    dataSource: DataSource!
    language: ProjectLanguage!
    tenancy: TenancySettings!
  }

  type TenantInfo {
    id: Int!
    name: String!
    slug: String!
    status: String!
  }

  type WorkspaceInfo {
    id: Int!
    name: String!
    slug: String!
    status: String!
  }

  type SettingsProjectInfo {
    id: Int!
    displayName: String
    type: DataSourceName!
  }

  type TenancySettings {
    tenant: TenantInfo
    workspace: WorkspaceInfo
    project: SettingsProjectInfo!
  }

  type GetMDLResult {
    hash: String!
    mdl: String
  }

  input PreviewSQLDataInput {
    sql: String!
    projectId: String
    limit: Int
    dryRun: Boolean
  }

  # Schema Change
  type SchemaChange {
    deletedTables: [DetailedChangeTable!]
    deletedColumns: [DetailedChangeTable!]
    modifiedColumns: [DetailedChangeTable!]
    lastSchemaChangeTime: String
  }

  type DetailedChangeTable {
    sourceTableName: String!
    displayName: String!
    columns: [DetailedChangeColumn!]!
    calculatedFields: [DetailedAffectedCalculatedFields!]!
    relationships: [DetailedAffectedRelationships!]!
  }

  type DetailedChangeColumn {
    sourceColumnName: String!
    displayName: String!
    type: String!
  }

  type DetailedAffectedCalculatedFields {
    displayName: String!
    referenceName: String!
    type: String!
  }

  type DetailedAffectedRelationships {
    displayName: String!
    referenceName: String!
  }

  input ResolveSchemaChangeWhereInput {
    type: SchemaChangeType!
  }

  # Learning
  type LearningRecord {
    paths: [String!]!
  }

  input SaveLearningRecordInput {
    path: String!
  }

  # Dashboard
  enum DashboardItemType {
    BAR
    PIE
    LINE
    MULTI_LINE
    AREA
    GROUPED_BAR
    STACKED_BAR
    TABLE
    NUMBER
  }

  input DashboardItemWhereInput {
    id: Int!
  }

  input CreateDashboardItemInput {
    itemType: DashboardItemType!
    responseId: Int!
  }

  input UpdateDashboardItemInput {
    displayName: String!
  }

  input ItemLayoutInput {
    itemId: Int!
    x: Int!
    y: Int!
    w: Int!
    h: Int!
  }

  input UpdateDashboardItemLayoutsInput {
    layouts: [ItemLayoutInput!]!
  }

  input DeleteDashboardItemInput {
    itemId: Int!
  }

  input PreviewItemSQLInput {
    itemId: Int!
    limit: Int
    refresh: Boolean = false
  }

  type PreviewItemResponse {
    data: JSON!
    cacheHit: Boolean!
    cacheCreatedAt: String
    cacheOverrodeAt: String
    override: Boolean!
  }

  input SetDashboardScheduleInput {
    cacheEnabled: Boolean!
    schedule: SetDashboardScheduleData
  }

  type DashboardSchedule {
    frequency: ScheduleFrequencyEnum
    hour: Int
    minute: Int
    day: CacheScheduleDayEnum
    timezone: String
    cron: String
  }

  input SetDashboardScheduleData {
    frequency: ScheduleFrequencyEnum!
    hour: Int
    minute: Int
    day: CacheScheduleDayEnum
    timezone: String
    cron: String
  }

  enum ScheduleFrequencyEnum {
    DAILY
    WEEKLY
    CUSTOM
    NEVER
  }

  enum CacheScheduleDayEnum {
    SUN
    MON
    TUE
    WED
    THU
    FRI
    SAT
  }

  type DashboardItemLayout {
    x: Int!
    y: Int!
    w: Int!
    h: Int!
  }

  type DashboardItemDetail {
    sql: String!
    chartSchema: JSON
  }

  type DashboardItem {
    id: Int!
    dashboardId: Int!
    type: DashboardItemType!
    layout: DashboardItemLayout!
    detail: DashboardItemDetail!
    displayName: String
  }

  type Dashboard {
    id: Int!
    projectId: Int!
    name: String!
    cacheEnabled: Boolean!
    scheduleFrequency: ScheduleFrequencyEnum
    scheduleTimezone: String
    scheduleCron: String
    nextScheduledAt: String
  }

  type DetailedDashboard {
    id: Int!
    name: String!
    description: String
    cacheEnabled: Boolean!
    nextScheduledAt: String
    schedule: DashboardSchedule
    items: [DashboardItem!]!
  }

  type SqlPair {
    id: Int!
    projectId: Int!
    sql: String!
    question: String!
    createdAt: String
    updatedAt: String
  }

  input CreateSqlPairInput {
    sql: String!
    question: String!
  }

  input UpdateSqlPairInput {
    sql: String
    question: String
  }

  input SqlPairWhereUniqueInput {
    id: Int!
  }

  input GenerateQuestionInput {
    sql: String!
  }

  input ModelSubstituteInput {
    sql: DialectSQL!
  }

  type Instruction {
    id: Int!
    projectId: Int!
    instruction: String!
    questions: [String!]!
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateInstructionInput {
    instruction: String!
    questions: [String!]!
    isDefault: Boolean!
  }

  input UpdateInstructionInput {
    instruction: String
    questions: [String!]
    isDefault: Boolean
  }

  input InstructionWhereInput {
    id: Int!
  }

  # Query and Mutation
  type Query {
    # On Boarding Steps
    listDataSourceTables(connectionId: Int): [CompactTable!]!
    autoGenerateRelation(connectionId: Int): [RecommendRelations!]!
    onboardingStatus: OnboardingStatusResponse!

    # Modeling Page
    listModels(connectionId: Int): [ModelInfo!]!
    model(where: ModelWhereInput!): DetailedModel!
    modelSync: ModelSyncResponse!
    diagram(connectionId: Int): Diagram!
    schemaChange: SchemaChange!

    # View
    listViews: [ViewInfo!]!
    view(where: ViewWhereUniqueInput!): ViewInfo!

    # Ask
    askingTask(taskId: String!): AskingTask
    suggestedQuestions: SuggestedQuestionResponse!
    threads: [Thread!]!
    thread(threadId: Int!): DetailedThread!
    threadResponse(responseId: Int!): ThreadResponse!
    nativeSql(responseId: Int!): String!

    # Adjustment
    adjustmentTask(taskId: String!): AdjustmentTask

    # Settings
    settings: Settings!
    dataSourceConnections: [DataSourceConnection!]!

    # System
    getMDL(hash: String!): GetMDLResult!

    # Learning
    learningRecord: LearningRecord!

    # Recommendation questions
    getThreadRecommendationQuestions(threadId: Int!): RecommendedQuestionsTask!
    getProjectRecommendationQuestions: RecommendedQuestionsTask!
    instantRecommendedQuestions(taskId: String!): RecommendedQuestionsTask!

    # Dashboard
    dashboardItems: [DashboardItem!]!
    dashboard: DetailedDashboard!

    # SQL Pairs
    sqlPairs: [SqlPair]!
    # Instructions
    instructions: [Instruction]!

    # Api History
    apiHistory(
      filter: ApiHistoryFilterInput
      pagination: ApiHistoryPaginationInput!
    ): ApiHistoryPaginatedResponse!
  }

  type Mutation {
    # On Boarding Steps
    saveDataSource(data: DataSourceInput!): DataSource!
    startSampleDataset(data: SampleDatasetInput!): JSON!
    saveTables(data: SaveTablesInput!): JSON!
    saveRelations(data: SaveRelationInput!): JSON!
    deploy(force: Boolean): JSON!

    # Modeling Page
    createModel(data: CreateModelInput!): JSON!
    updateModel(where: ModelWhereInput!, data: UpdateModelInput!): JSON!
    deleteModel(where: ModelWhereInput!): Boolean!
    previewModelData(where: WhereIdInput!): JSON!
    triggerDataSourceDetection: Boolean!
    resolveSchemaChange(where: ResolveSchemaChangeWhereInput!): Boolean!

    # Metadata
    updateModelMetadata(
      where: ModelWhereInput!
      data: UpdateModelMetadataInput!
    ): Boolean!
    updateViewMetadata(
      where: ViewWhereUniqueInput!
      data: UpdateViewMetadataInput!
    ): Boolean!

    # Relation
    createRelation(data: RelationInput!): JSON!
    updateRelation(data: UpdateRelationInput!, where: WhereIdInput!): JSON!
    deleteRelation(where: WhereIdInput!): Boolean!

    # Calculated field
    createCalculatedField(data: CreateCalculatedFieldInput!): JSON!
    updateCalculatedField(
      where: UpdateCalculatedFieldWhere!
      data: UpdateCalculatedFieldInput!
    ): JSON!
    deleteCalculatedField(where: UpdateCalculatedFieldWhere): Boolean!
    validateCalculatedField(
      data: ValidateCalculatedFieldInput!
    ): CalculatedFieldValidationResponse!

    # View
    createView(data: CreateViewInput!): ViewInfo!
    deleteView(where: ViewWhereUniqueInput!): Boolean!
    previewViewData(where: PreviewViewDataInput!): JSON!
    validateView(data: ValidateViewInput!): ViewValidationResponse!

    # Ask
    createAskingTask(data: AskingTaskInput!): Task!
    cancelAskingTask(taskId: String!): Boolean!
    rerunAskingTask(responseId: Int!): Task!

    # Thread
    createThread(data: CreateThreadInput!): Thread!
    updateThread(
      where: ThreadUniqueWhereInput!
      data: UpdateThreadInput!
    ): Thread!
    deleteThread(where: ThreadUniqueWhereInput!): Boolean!

    # Thread Response
    createThreadResponse(
      threadId: Int!
      data: CreateThreadResponseInput!
    ): ThreadResponse!
    updateThreadResponse(
      where: ThreadResponseUniqueWhereInput!
      data: UpdateThreadResponseInput!
    ): ThreadResponse!
    previewData(where: PreviewDataInput!): JSON!
    previewBreakdownData(where: PreviewDataInput!): JSON!

    # Generate Thread Response Breakdown
    generateThreadResponseBreakdown(responseId: Int!): ThreadResponse!

    # Generate Thread Response Answer
    generateThreadResponseAnswer(responseId: Int!): ThreadResponse!

    # Generate Thread Response Chart
    generateThreadResponseChart(responseId: Int!): ThreadResponse!

    # Adjust Thread Response Chart
    adjustThreadResponseChart(
      responseId: Int!
      data: AdjustThreadResponseChartInput!
    ): ThreadResponse!

    # Adjustment
    adjustThreadResponse(
      responseId: Int!
      data: AdjustThreadResponseInput!
    ): ThreadResponse!
    cancelAdjustmentTask(taskId: String!): Boolean!
    rerunAdjustmentTask(responseId: Int!): Boolean!

    # Settings
    resetCurrentProject: Boolean!
    updateCurrentProject(data: UpdateCurrentProjectInput!): Boolean!
    updateDataSource(data: UpdateDataSourceInput!): DataSource!
    switchDataSource(where: WhereIdInput!): Boolean!
    updateDataSourceConnectionStatus(
      where: WhereIdInput!
      data: UpdateDataSourceConnectionStatusInput!
    ): Boolean!
    deleteDataSourceConnection(where: WhereIdInput!): Boolean!

    # preview
    previewSql(data: PreviewSQLDataInput): JSON!

    # Learning
    saveLearningRecord(data: SaveLearningRecordInput!): LearningRecord!

    # Recommendation questions
    generateThreadRecommendationQuestions(threadId: Int!): Boolean!
    generateProjectRecommendationQuestions: Boolean!
    createInstantRecommendedQuestions(
      data: InstantRecommendedQuestionsInput!
    ): Task!

    # Dashboard
    updateDashboardItemLayouts(
      data: UpdateDashboardItemLayoutsInput!
    ): [DashboardItem!]!
    createDashboardItem(data: CreateDashboardItemInput!): DashboardItem!
    updateDashboardItem(
      where: DashboardItemWhereInput!
      data: UpdateDashboardItemInput!
    ): DashboardItem!
    deleteDashboardItem(where: DashboardItemWhereInput!): Boolean!
    previewItemSQL(data: PreviewItemSQLInput!): PreviewItemResponse!
    setDashboardSchedule(data: SetDashboardScheduleInput!): Dashboard!

    # SQL Pairs
    createSqlPair(data: CreateSqlPairInput!): SqlPair!
    updateSqlPair(
      where: SqlPairWhereUniqueInput!
      data: UpdateSqlPairInput!
    ): SqlPair!
    deleteSqlPair(where: SqlPairWhereUniqueInput!): Boolean!
    generateQuestion(data: GenerateQuestionInput!): String!
    modelSubstitute(data: ModelSubstituteInput!): String!
    # Instructions
    createInstruction(data: CreateInstructionInput!): Instruction!
    updateInstruction(
      where: InstructionWhereInput!
      data: UpdateInstructionInput!
    ): Instruction!
    deleteInstruction(where: InstructionWhereInput!): Boolean!
  }
`},5675:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>T,default:()=>R});var i=a(2799),n=a.n(i),o=a(6352),s=a(7280),d=a(678),l=a(5434),m=a(2759),p=a(1458),c=a(4634),u=a(827),h=a(5913),y=a(9958),g=e([s,d,p,u,h]);[s,d,p,u,h]=g.then?(await g)():g;let I=(0,m.i)(),N=(0,l.jl)("APOLLO");N.level="debug";let S=n()(),T={api:{bodyParser:!1}},w=(async()=>{let{telemetry:e,knex:t,projectRepository:a,modelRepository:r,modelColumnRepository:i,relationRepository:n,deployLogRepository:l,viewRepository:m,schemaChangeRepository:g,learningRepository:S,modelNestedColumnRepository:T,dashboardRepository:w,dashboardItemRepository:f,sqlPairRepository:R,instructionRepository:_,apiHistoryRepository:C,dashboardItemRefreshJobRepository:A,wrenEngineAdaptor:v,ibisAdaptor:b,wrenAIAdaptor:D,projectService:E,queryService:M,askingService:P,deployService:O,mdlService:j,dashboardService:q,sqlPairService:k,instructionService:B,projectRecommendQuestionBackgroundTracker:L,threadRecommendQuestionBackgroundTracker:G,dashboardCacheBackgroundTracker:V}=h.components,U=new p.b({projectService:E,modelRepository:r,modelColumnRepository:i,relationRepository:n,viewRepository:m,mdlService:j,wrenEngineAdaptor:v,queryService:M});await Promise.all([P.initialize(),L.initialize(),G.initialize()]);let H=new o.ApolloServer({typeDefs:s.U,resolvers:d.Z,formatError:t=>{if(t.extensions?.code===c.GL.DRY_RUN_ERROR)return(0,c.EJ)(t);let a=t.extensions?.exception?.stacktrace;a&&N.error(a.join("\n"));let r=t.extensions?.originalError;return r&&(N.error("== original error =="),N.error(r.stack||r.message)),t.extensions?.code===c.GL.INTERNAL_SERVER_ERROR&&e.sendEvent(u.MW.GRAPHQL_ERROR,{originalErrorStack:r?.stack,originalErrorMessage:r?.message,errorMessage:t.message},t.extensions?.service,!1),(0,c.EJ)(t)},introspection:!1,context:async({req:o})=>({config:I,auth:{user:await (0,y.IC)(t,o),internalService:(0,y.bF)(o)},telemetry:e,wrenEngineAdaptor:v,ibisServerAdaptor:b,wrenAIAdaptor:D,projectService:E,modelService:U,mdlService:j,deployService:O,askingService:P,queryService:M,dashboardService:q,sqlPairService:k,instructionService:B,projectRepository:a,modelRepository:r,modelColumnRepository:i,modelNestedColumnRepository:T,relationRepository:n,viewRepository:m,deployRepository:l,schemaChangeRepository:g,learningRepository:S,dashboardRepository:w,dashboardItemRepository:f,sqlPairRepository:R,instructionRepository:_,apiHistoryRepository:C,dashboardItemRefreshJobRepository:A,projectRecommendQuestionBackgroundTracker:L,threadRecommendQuestionBackgroundTracker:G,dashboardCacheBackgroundTracker:V})});return await H.start(),H})(),f=async(e,t)=>{let a=await w;await a.createHandler({path:"/api/graphql"})(e,t)},R=S((e,t)=>"OPTIONS"===e.method?t.status(200).end():f(e,t));r()}catch(e){r(e)}})},3888:(e,t,a)=>{t._=a(752).__decorate}};var t=require("../../webpack-api-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[259,913],()=>a(4813));module.exports=r})();