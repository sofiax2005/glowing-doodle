-- database/init-scripts/tv-channel-schema.sql
-- Denormalized TV Channel Data (UNF) for NormalDB Demo

DROP TABLE IF EXISTS tv_channel_data CASCADE;

CREATE TABLE tv_channel_data (
    network_id INTEGER,
    network_name VARCHAR(100),
    network_description TEXT,

    channel_id INTEGER,
    channel_name VARCHAR(100),
    channel_frequency INTEGER,
    channel_logo VARCHAR(255),

    program_id INTEGER,
    program_title VARCHAR(200),
    program_description TEXT,
    program_genre VARCHAR(50),
    program_rating VARCHAR(10),

    episode_id INTEGER,
    episode_title VARCHAR(200),
    episode_synopsis TEXT,
    episode_air_date DATE,
    episode_duration INTEGER,

    schedule_id INTEGER,
    schedule_start_time TIMESTAMP,
    schedule_end_time TIMESTAMP,

    ad_id INTEGER,
    ad_name VARCHAR(200),
    ad_frequency INTEGER,
    ad_start_date DATE,
    ad_end_date DATE,

    stream_id INTEGER,
    stream_type VARCHAR(20),
    stream_url VARCHAR(255),

    trp_report_id INTEGER,
    trp_date DATE,
    trp_time_slot VARCHAR(50),
    trp_value DECIMAL(5,2),
    trp_target_audience VARCHAR(100),

    device_id INTEGER,
    household_id INTEGER,
    household_address TEXT,
    household_region VARCHAR(100),
    household_sample_type VARCHAR(20),

    demographic_id INTEGER,
    age_group VARCHAR(20),
    gender VARCHAR(10),
    income_level VARCHAR(50)
);

-- Sample rows with intentional redundancy
INSERT INTO tv_channel_data VALUES
-- NewsFirst Network
(1, 'NewsFirst Network', 'Leading news broadcasting network',
 101, 'NewsFirst HD', 501, 'https://cdn.example.com/newsfirst_logo.png',
 1001, 'Morning Brief', 'Daily morning news roundup', 'News', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5001, '2024-01-15 06:00:00', '2024-01-15 08:00:00',
 2001, 'AutoMax Commercial', 5, '2024-01-01', '2024-03-31',
 3001, 'HD', 'https://stream.example.com/newsfirst_hd',
 4001, '2024-01-15', 'Morning', 4.5, 'Adults 25-54',
 6001, 7001, '123 Main St, Mumbai', 'Mumbai Metro', 'Urban',
 8001, '25-34', 'Male', 'Middle'),

(1, 'NewsFirst Network', 'Leading news broadcasting network',
 101, 'NewsFirst HD', 501, 'https://cdn.example.com/newsfirst_logo.png',
 1001, 'Morning Brief', 'Daily morning news roundup', 'News', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5002, '2024-01-16 06:00:00', '2024-01-16 08:00:00',
 2001, 'AutoMax Commercial', 5, '2024-01-01', '2024-03-31',
 3001, 'HD', 'https://stream.example.com/newsfirst_hd',
 4002, '2024-01-16', 'Morning', 4.7, 'Adults 25-54',
 6002, 7002, '456 Oak Ave, Delhi', 'Delhi NCR', 'Urban',
 8002, '35-44', 'Female', 'Upper Middle'),

(1, 'NewsFirst Network', 'Leading news broadcasting network',
 101, 'NewsFirst HD', 501, 'https://cdn.example.com/newsfirst_logo.png',
 1002, 'Prime Time News', 'Evening news analysis', 'News', 'TV-PG',
 NULL, NULL, NULL, NULL, NULL,
 5003, '2024-01-15 20:00:00', '2024-01-15 21:00:00',
 2002, 'TechGadgets Ad', 3, '2024-01-01', '2024-06-30',
 3001, 'HD', 'https://stream.example.com/newsfirst_hd',
 4003, '2024-01-15', 'Prime Time', 8.2, 'Adults 25-54',
 6003, 7003, '789 Park Rd, Bangalore', 'Bangalore', 'Urban',
 8003, '45-54', 'Male', 'High'),

-- EntertainMax Gold
(2, 'EntertainMax', 'Premium entertainment channel network',
 201, 'EntertainMax Gold', 601, 'https://cdn.example.com/entertainmax_logo.png',
 2001, 'The Family', 'Drama series about a business family', 'Drama', 'TV-14',
 10001, 'Pilot Episode', 'The family business faces a crisis', '2024-01-10', 45,
 5004, '2024-01-10 21:00:00', '2024-01-10 21:45:00',
 2003, 'Fashion Brand X', 4, '2024-01-01', '2024-12-31',
 3002, 'HD', 'https://stream.example.com/entertainmax_hd',
 4004, '2024-01-10', 'Prime Time', 6.8, 'Adults 18-49',
 6004, 7004, '321 Lake View, Hyderabad', 'Hyderabad', 'Urban',
 8004, '18-24', 'Female', 'Middle'),

(2, 'EntertainMax', 'Premium entertainment channel network',
 201, 'EntertainMax Gold', 601, 'https://cdn.example.com/entertainmax_logo.png',
 2001, 'The Family', 'Drama series about a business family', 'Drama', 'TV-14',
 10002, 'Episode 2: The Deal', 'A major business deal is negotiated', '2024-01-17', 45,
 5005, '2024-01-17 21:00:00', '2024-01-17 21:45:00',
 2003, 'Fashion Brand X', 4, '2024-01-01', '2024-12-31',
 3002, 'HD', 'https://stream.example.com/entertainmax_hd',
 4005, '2024-01-17', 'Prime Time', 7.1, 'Adults 18-49',
 6005, 7005, '555 River St, Chennai', 'Chennai', 'Urban',
 8005, '25-34', 'Male', 'Middle'),

(2, 'EntertainMax', 'Premium entertainment channel network',
 201, 'EntertainMax Gold', 601, 'https://cdn.example.com/entertainmax_logo.png',
 2002, 'Laugh Out Loud', 'Stand-up comedy show', 'Comedy', 'TV-MA',
 NULL, NULL, NULL, NULL, NULL,
 5006, '2024-01-12 22:00:00', '2024-01-12 23:00:00',
 2004, 'Beverage Co Ad', 6, '2024-01-01', '2024-02-29',
 3002, 'HD', 'https://stream.example.com/entertainmax_hd',
 4006, '2024-01-12', 'Late Night', 5.3, 'Adults 18-34',
 6006, 7006, '888 Hill Top, Pune', 'Pune', 'Urban',
 8006, '18-24', 'Male', 'Lower Middle'),

-- SportsZone Live
(3, 'SportsZone', 'Sports broadcasting network',
 301, 'SportsZone Live', 701, 'https://cdn.example.com/sportszone_logo.png',
 3001, 'IPL Cricket Live', 'Live cricket match coverage', 'Sports', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5007, '2024-01-14 19:00:00', '2024-01-14 23:00:00',
 2005, 'Sports Shoes Ad', 8, '2024-01-01', '2024-04-30',
 3003, 'HD', 'https://stream.example.com/sportszone_hd',
 4007, '2024-01-14', 'Prime Time', 12.5, 'All Adults',
 6007, 7007, '999 Stadium Rd, Kolkata', 'Kolkata', 'Urban',
 8007, '25-34', 'Male', 'Middle'),

(3, 'SportsZone', 'Sports broadcasting network',
 301, 'SportsZone Live', 701, 'https://cdn.example.com/sportszone_logo.png',
 3001, 'IPL Cricket Live', 'Live cricket match coverage', 'Sports', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5007, '2024-01-14 19:00:00', '2024-01-14 23:00:00',
 2005, 'Sports Shoes Ad', 8, '2024-01-01', '2024-04-30',
 3004, 'SD', 'https://stream.example.com/sportszone_sd',
 4008, '2024-01-14', 'Prime Time', 12.5, 'All Adults',
 6008, 7008, '111 Village Square, Jaipur', 'Jaipur', 'Rural',
 8008, '35-44', 'Male', 'Lower Middle'),

-- Weather Update
(1, 'NewsFirst Network', 'Leading news broadcasting network',
 102, 'NewsFirst SD', 502, 'https://cdn.example.com/newsfirst_logo_sd.png',
 1003, 'Weather Update', 'Hourly weather forecast', 'News', 'TV-G',
 NULL, NULL, NULL, NULL, NULL,
 5008, '2024-01-15 07:00:00', '2024-01-15 07:15:00',
 2006, 'Home Appliances', 2, '2024-01-15', '2024-02-15',
 3005, 'SD', 'https://stream.example.com/newsfirst_sd',
 4009, '2024-01-15', 'Morning', 2.1, 'All Adults',
 6009, 7009, '222 Market St, Ahmedabad', 'Ahmedabad', 'Urban',
 8009, '55+', 'Female', 'Middle');

-- Indexes for performance (optional for demo)
CREATE INDEX idx_network_id ON tv_channel_data(network_id);
CREATE INDEX idx_channel_id ON tv_channel_data(channel_id);
CREATE INDEX idx_program_id ON tv_channel_data(program_id);
CREATE INDEX idx_trp_date ON tv_channel_data(trp_date);

-- Grant permissions for demo user (change as needed)
GRANT ALL PRIVILEGES ON TABLE tv_channel_data TO normaldb;

-- Optional comment:
COMMENT ON TABLE tv_channel_data IS
'Denormalized TV channel data (UNF) for demonstration. Contains redundancy: repeated info for network/channel/program/ad/schedule etc.';
