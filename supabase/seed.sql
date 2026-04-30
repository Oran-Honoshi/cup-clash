-- ============================================================
-- Cup Clash — Seed: Import all WC2026 matches into Supabase
-- Run AFTER all migrations (001-004)
-- ============================================================

insert into public.matches (id, home, away, home_flag, away_flag, kickoff_at, stage, group_letter, stadium, city, host_country)
values
-- GROUP A
('g001','Mexico','South Africa','mx','za','2026-06-11T20:00:00Z','Group','A','Estadio Azteca','Mexico City','MEX'),
('g027','Korea Republic','Czechia','kr','cz','2026-06-16T02:00:00Z','Group','A','Estadio Chivas (Akron)','Guadalajara','MEX'),
('g028','Mexico','Korea Republic','mx','kr','2026-06-19T23:00:00Z','Group','A','Rose Bowl','Los Angeles','USA'),
('g025','South Africa','Czechia','za','cz','2026-06-20T02:00:00Z','Group','A','Estadio Azteca','Mexico City','MEX'),
('g051','Czechia','Mexico','cz','mx','2026-06-24T02:00:00Z','Group','A','Estadio Azteca','Mexico City','MEX'),
('g053','South Africa','Korea Republic','za','kr','2026-06-24T02:00:00Z','Group','A','Rose Bowl','Los Angeles','USA'),
-- GROUP B
('g003','Canada','Bosnia & Herzegovina','ca','ba','2026-06-12T20:00:00Z','Group','B','BMO Field','Toronto','CAN'),
('g008','Qatar','Switzerland','qa','ch','2026-06-14T20:00:00Z','Group','B','Levi''s Stadium','San Francisco','USA'),
('g024','Canada','Qatar','ca','qa','2026-06-19T04:00:00Z','Group','B','Rose Bowl','Los Angeles','USA'),
('g026','Switzerland','Bosnia & Herzegovina','ch','ba','2026-06-19T20:00:00Z','Group','B','Levi''s Stadium','San Francisco','USA'),
('g052','Bosnia & Herzegovina','Qatar','ba','qa','2026-06-23T20:00:00Z','Group','B','BMO Field','Toronto','CAN'),
('g044','Switzerland','Canada','ch','ca','2026-06-24T04:00:00Z','Group','B','Levi''s Stadium','San Francisco','USA'),
-- GROUP C
('g004','Brazil','Morocco','br','ma','2026-06-13T02:00:00Z','Group','C','MetLife Stadium','New York/NJ','USA'),
('g007','Haiti','Scotland','ht','gb-sct','2026-06-13T23:00:00Z','Group','C','Hard Rock Stadium','Miami','USA'),
('g028b','Brazil','Haiti','br','ht','2026-06-18T02:00:00Z','Group','C','Rose Bowl','Los Angeles','USA'),
('g029','Scotland','Morocco','gb-sct','ma','2026-06-18T01:30:00Z','Group','C','Hard Rock Stadium','Miami','USA'),
('g047','Morocco','Haiti','ma','ht','2026-06-21T18:00:00Z','Group','C','MetLife Stadium','New York/NJ','USA'),
('g050','Scotland','Brazil','gb-sct','br','2026-06-21T23:00:00Z','Group','C','Hard Rock Stadium','Miami','USA'),
-- GROUP D
('g005','USA','Paraguay','us','py','2026-06-13T05:00:00Z','Group','D','Levi''s Stadium','San Francisco','USA'),
('g018','Türkiye','USA','tr','us','2026-06-15T02:00:00Z','Group','D','Lumen Field','Seattle','USA'),
('g030','USA','Australia','us','au','2026-06-18T23:00:00Z','Group','D','Rose Bowl','Los Angeles','USA'),
('g031','Paraguay','Türkiye','py','tr','2026-06-19T04:00:00Z','Group','D','Levi''s Stadium','San Francisco','USA'),
('g058','Paraguay','Australia','py','au','2026-06-23T00:00:00Z','Group','D','Lumen Field','Seattle','USA'),
('g059','Türkiye','USA','tr','us','2026-06-23T03:00:00Z','Group','D','Levi''s Stadium','San Francisco','USA'),
-- GROUP E
('g010','Germany','Curaçao','de','cw','2026-06-14T18:00:00Z','Group','E','AT&T Stadium','Dallas','USA'),
('g011','Côte d''Ivoire','Ecuador','ci','ec','2026-06-15T00:00:00Z','Group','E','NRG Stadium','Houston','USA'),
('g034','Germany','Côte d''Ivoire','de','ci','2026-06-19T01:00:00Z','Group','E','AT&T Stadium','Dallas','USA'),
('g036','Ecuador','Curaçao','ec','cw','2026-06-19T05:00:00Z','Group','E','Lincoln Financial Field','Philadelphia','USA'),
('g049','Ecuador','Germany','ec','de','2026-06-22T23:00:00Z','Group','E','NRG Stadium','Houston','USA'),
('g056','Curaçao','Côte d''Ivoire','cw','ci','2026-06-22T21:00:00Z','Group','E','AT&T Stadium','Dallas','USA'),
-- GROUP F
('g012','Netherlands','Japan','nl','jp','2026-06-15T03:00:00Z','Group','F','Estadio BBVA','Monterrey','MEX'),
('g012b','Sweden','Tunisia','se','tn','2026-06-15T17:00:00Z','Group','F','Estadio BBVA','Monterrey','MEX'),
('g032','Tunisia','Japan','tn','jp','2026-06-18T20:00:00Z','Group','F','AT&T Stadium','Dallas','USA'),
('g035','Netherlands','Sweden','nl','se','2026-06-19T18:00:00Z','Group','F','Lumen Field','Seattle','USA'),
('g055','Tunisia','Netherlands','tn','nl','2026-06-22T21:00:00Z','Group','F','Estadio BBVA','Monterrey','MEX'),
('g057','Japan','Sweden','jp','se','2026-06-23T00:00:00Z','Group','F','Lumen Field','Seattle','USA'),
-- GROUP G
('g015','IR Iran','New Zealand','ir','nz','2026-06-16T02:00:00Z','Group','G','BC Place','Vancouver','CAN'),
('g016','Belgium','Egypt','be','eg','2026-06-16T20:00:00Z','Group','G','Rose Bowl','Los Angeles','USA'),
('g039','New Zealand','Egypt','nz','eg','2026-06-20T20:00:00Z','Group','G','Lumen Field','Seattle','USA'),
('g043','Belgium','IR Iran','be','ir','2026-06-20T18:00:00Z','Group','G','BC Place','Vancouver','CAN'),
('g060','New Zealand','Belgium','nz','be','2026-06-25T03:00:00Z','Group','G','Rose Bowl','Los Angeles','USA'),
('g070','Egypt','IR Iran','eg','ir','2026-06-25T03:00:00Z','Group','G','BC Place','Vancouver','CAN'),
-- GROUP H
('g013','Spain','Cabo Verde','es','cv','2026-06-15T18:00:00Z','Group','H','Mercedes-Benz Stadium','Atlanta','USA'),
('g009','Saudi Arabia','Uruguay','sa','uy','2026-06-14T23:00:00Z','Group','H','Hard Rock Stadium','Miami','USA'),
('g037','Spain','Saudi Arabia','es','sa','2026-06-19T23:00:00Z','Group','H','Mercedes-Benz Stadium','Atlanta','USA'),
('g046','Uruguay','Cabo Verde','uy','cv','2026-06-21T00:00:00Z','Group','H','Arrowhead Stadium','Kansas City','USA'),
('g064','Cabo Verde','Saudi Arabia','cv','sa','2026-06-25T04:00:00Z','Group','H','Mercedes-Benz Stadium','Atlanta','USA'),
('g065','Uruguay','Spain','uy','es','2026-06-25T01:00:00Z','Group','H','Hard Rock Stadium','Miami','USA'),
-- GROUP I
('g019','France','Senegal','fr','sn','2026-06-17T02:00:00Z','Group','I','MetLife Stadium','New York/NJ','USA'),
('g018b','Iraq','Norway','iq','no','2026-06-17T23:00:00Z','Group','I','Gillette Stadium','Boston','USA'),
('g033','Norway','Senegal','no','sn','2026-06-20T21:00:00Z','Group','I','BMO Field','Toronto','CAN'),
('g042','Senegal','Iraq','sn','iq','2026-06-21T22:00:00Z','Group','I','Gillette Stadium','Boston','USA'),
('g066','Norway','France','no','fr','2026-06-26T01:00:00Z','Group','I','MetLife Stadium','New York/NJ','USA'),
('g048','France','Iraq','fr','iq','2026-06-26T03:00:00Z','Group','I','Gillette Stadium','Boston','USA'),
-- GROUP J
('g020','Argentina','Algeria','ar','dz','2026-06-16T05:00:00Z','Group','J','Levi''s Stadium','San Francisco','USA'),
('g014','Austria','Jordan','at','jo','2026-06-15T17:00:00Z','Group','J','AT&T Stadium','Dallas','USA'),
('g038','Argentina','Austria','ar','at','2026-06-20T17:00:00Z','Group','J','Arrowhead Stadium','Kansas City','USA'),
('g040','Jordan','Algeria','jo','dz','2026-06-21T02:00:00Z','Group','J','AT&T Stadium','Dallas','USA'),
('g069','Jordan','Argentina','jo','ar','2026-06-26T03:00:00Z','Group','J','Levi''s Stadium','San Francisco','USA'),
('g071','Algeria','Austria','dz','at','2026-06-26T00:30:00Z','Group','J','Arrowhead Stadium','Kansas City','USA'),
-- GROUP K
('g072','Congo DR','Uzbekistan','cd','uz','2026-06-16T00:30:00Z','Group','K','Mercedes-Benz Stadium','Atlanta','USA'),
('g023','Portugal','Congo DR','pt','cd','2026-06-16T18:00:00Z','Group','K','NRG Stadium','Houston','USA'),
('g041','Colombia','Congo DR','co','cd','2026-06-20T05:00:00Z','Group','K','Arrowhead Stadium','Kansas City','USA'),
('g054','Portugal','Uzbekistan','pt','uz','2026-06-22T02:00:00Z','Group','K','Mercedes-Benz Stadium','Atlanta','USA'),
('g068','Colombia','Portugal','co','pt','2026-06-25T22:00:00Z','Group','K','NRG Stadium','Houston','USA'),
('g022','Uzbekistan','Colombia','uz','co','2026-06-16T21:00:00Z','Group','K','Arrowhead Stadium','Kansas City','USA'),
-- GROUP L
('g021','England','Croatia','gb-eng','hr','2026-06-17T00:00:00Z','Group','L','BMO Field','Toronto','CAN'),
('g017','Ghana','Panama','gh','pa','2026-06-16T20:00:00Z','Group','L','Gillette Stadium','Boston','USA'),
('g041b','England','Ghana','gb-eng','gh','2026-06-21T01:00:00Z','Group','L','Gillette Stadium','Boston','USA'),
('g045','Panama','Croatia','pa','hr','2026-06-21T21:00:00Z','Group','L','Mercedes-Benz Stadium','Atlanta','USA'),
('g061','Panama','England','pa','gb-eng','2026-06-25T20:00:00Z','Group','L','BMO Field','Toronto','CAN'),
('g067','Croatia','Ghana','hr','gh','2026-06-25T22:00:00Z','Group','L','Gillette Stadium','Boston','USA'),
-- ROUND OF 32
('r001','2A','2B',null,null,'2026-06-28T20:00:00Z','R32',null,'TBD','TBD','USA'),
('r002','1K','3DEIJL',null,null,'2026-06-29T00:30:00Z','R32',null,'TBD','TBD','USA'),
('r003','1A','3CEFHI',null,null,'2026-06-29T02:00:00Z','R32',null,'TBD','TBD','USA'),
('r004','1E','3ABCDF',null,null,'2026-06-29T17:00:00Z','R32',null,'TBD','TBD','USA'),
('r005','1I','3CDFGH',null,null,'2026-06-29T21:30:00Z','R32',null,'TBD','TBD','USA'),
('r006','1D','3BEFIJ',null,null,'2026-06-30T02:00:00Z','R32',null,'TBD','TBD','USA'),
('r007','1F','2C',null,null,'2026-06-30T21:00:00Z','R32',null,'TBD','TBD','USA'),
('r008','1C','2F',null,null,'2026-07-01T02:00:00Z','R32',null,'TBD','TBD','USA'),
('r009','2E','2I',null,null,'2026-07-01T18:00:00Z','R32',null,'TBD','TBD','USA'),
('r010','1H','2J',null,null,'2026-07-01T22:00:00Z','R32',null,'TBD','TBD','USA'),
('r011','1G','3AEHIJ',null,null,'2026-07-02T01:00:00Z','R32',null,'TBD','TBD','USA'),
('r012','2K','2L',null,null,'2026-07-02T18:00:00Z','R32',null,'TBD','TBD','USA'),
('r013','1B','3EFGIJ',null,null,'2026-07-02T21:00:00Z','R32',null,'TBD','TBD','USA'),
('r014','1L','3EHIJK',null,null,'2026-07-03T01:00:00Z','R32',null,'TBD','TBD','USA'),
('r015','2D','2G',null,null,'2026-07-03T19:00:00Z','R32',null,'TBD','TBD','USA'),
('r016','1J','2H',null,null,'2026-07-03T23:00:00Z','R32',null,'TBD','TBD','USA'),
-- FINAL
('final','W(SF1)','W(SF2)',null,null,'2026-07-19T20:00:00Z','Final',null,'MetLife Stadium','New York/NJ','USA'),
('bronze','L(SF1)','L(SF2)',null,null,'2026-07-18T20:00:00Z','3rd',null,'Hard Rock Stadium','Miami','USA')
on conflict (id) do update set
  home = excluded.home,
  away = excluded.away,
  home_flag = excluded.home_flag,
  away_flag = excluded.away_flag,
  kickoff_at = excluded.kickoff_at,
  stage = excluded.stage,
  group_letter = excluded.group_letter,
  stadium = excluded.stadium,
  city = excluded.city,
  host_country = excluded.host_country;

select count(*) as matches_seeded from public.matches;
