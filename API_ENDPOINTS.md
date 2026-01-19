$Sage Token Backend API
1.0.0
OAS 3.1
/openapi.json
Backend API for $Sage Token mining and rewards platform

Authorize
Authentication

POST
/auth/register
Register

Register a new user

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"email": "user@example.com",
"password": "string",
"wallet_address": "string",
"referral_code": "string",
"cookies_enabled": true,
"privacy_accepted": false
}
Responses
Code Description Links
201
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"access_token": "string",
"token_type": "bearer",
"user": {
"id": 0,
"email": "string",
"wallet_address": "string",
"referral_code": "string",
"token_balance": 0,
"total_earned": 0,
"boost_count": 0,
"created_at": "2026-01-08T13:36:59.590Z"
}
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

POST
/auth/login
Login

Login user

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"email": "user@example.com",
"password": "string"
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"access_token": "string",
"token_type": "bearer",
"user": {
"id": 0,
"email": "string",
"wallet_address": "string",
"referral_code": "string",
"token_balance": 0,
"total_earned": 0,
"boost_count": 0,
"created_at": "2026-01-08T13:36:59.597Z"
}
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/auth/me
Get Current User Info

Get current user information

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"email": "string",
"wallet_address": "string",
"referral_code": "string",
"token_balance": 0,
"total_earned": 0,
"boost_count": 0,
"created_at": "2026-01-08T13:36:59.601Z"
}
No links

POST
/auth/sageadmin/login
Admin Login

Admin login

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"username": "string",
"password": "string"
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"access_token": "string",
"token_type": "bearer",
"admin": {
"id": 0,
"username": "string",
"created_at": "2026-01-08T13:36:59.605Z"
}
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/auth/sageadmin/me
Get Current Admin Info

Get current admin information

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"username": "string",
"created_at": "2026-01-08T13:36:59.608Z"
}
No links
Mining

GET
/mining/active-session
Get Active Session

Get active mining session information

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"is_active": true,
"mining_circle_id": 0,
"start_time": "2026-01-08T13:36:59.611Z",
"end_time": "2026-01-08T13:36:59.611Z",
"duration_seconds": 0,
"token_reward_rate": 0,
"can_start": false,
"message": "string"
}
No links

POST
/mining/start
Start Mining

Start a mining session

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"success": true,
"session_id": 0,
"start_time": "2026-01-08T13:36:59.613Z",
"end_time": "2026-01-08T13:36:59.613Z",
"duration_seconds": 0,
"token_reward_rate": 0,
"message": "string"
}
No links

POST
/mining/complete
Complete Mining

Complete a mining session

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"session_id": 0
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"success": true,
"tokens_earned": 0,
"new_balance": 0,
"message": "string"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

POST
/mining/boost
Boost Mining

Apply boost to mining session after ad completion

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"session_id": 0
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"success": true,
"boost_count": 0,
"time_added_seconds": 0,
"new_end_time": "2026-01-08T13:36:59.620Z",
"message": "string"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links
Ads

POST
/ads/boost-complete
Boost Complete

Complete ad viewing and apply boost to mining session. This endpoint is called after the frontend completes an AdMob ad.

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"session_id": 0
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"success": true,
"boost_count": 0,
"time_added_seconds": 0,
"new_end_time": "2026-01-08T13:36:59.624Z",
"message": "string"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links
Tasks

GET
/tasks
Get Tasks

Get all active tasks

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"title": "string",
"description": "string",
"task_type": "admob",
"reward_amount": 0,
"is_active": true,
"created_at": "2026-01-08T13:36:59.628Z",
"is_completed": true
}
]
No links

POST
/tasks/complete
Complete Task Endpoint

Complete a task

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"task_id": 0
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"success": true,
"reward_claimed": 0,
"new_balance": 0,
"message": "string"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links
Referrals

GET
/referrals/stats
Get Referral Stats Endpoint

Get referral statistics

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"referral_code": "string",
"total_referrals": 0,
"total_rewards_earned": 0
}
No links
Withdrawals

POST
/withdrawals/request
Request Withdrawal

Request a withdrawal

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"amount": 1,
"wallet_address": "string"
}
Responses
Code Description Links
201
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"amount": 0,
"wallet_address": "string",
"status": "pending",
"created_at": "2026-01-08T13:36:59.637Z"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/withdrawals
Get My Withdrawals

Get user's withdrawal history

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"amount": 0,
"wallet_address": "string",
"status": "pending",
"created_at": "2026-01-08T13:36:59.648Z"
}
]
No links
Exchange Rates

GET
/rates/sage-usd
Get Sage Usd Rate

Get current Sage to USD exchange rate

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"sage_usd_rate": 0,
"updated_at": "2026-01-08T13:36:59.650Z"
}
No links
Notifications

GET
/notifications
Get Notifications

Get user notifications

Parameters
Try it out
Name Description
unread_only
boolean
(query)
Default value : false

false
limit
integer
(query)
Default value : 50

50
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"notification_type": "mining_circle",
"title": "string",
"message": "string",
"is_read": true,
"created_at": "2026-01-08T13:36:59.653Z"
}
]
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/notifications/unread-count
Get Unread Count Endpoint

Get unread notification count

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"unread_count": 0
}
No links

POST
/notifications/{notification_id}/read
Mark Notification Read Endpoint

Mark a notification as read

Parameters
Try it out
Name Description
notification_id \*
integer
(path)
notification_id
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

POST
/notifications/read-all
Mark All Read

Mark all notifications as read

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
Chat

POST
/chat/send
Send Message

Send a message to admin

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"message": "string"
}
Responses
Code Description Links
201
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"message": "string",
"admin_reply": "string",
"admin_replied_at": "2026-01-08T13:36:59.663Z",
"created_at": "2026-01-08T13:36:59.663Z"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/chat
Get Messages

Get user's chat messages

Parameters
Try it out
Name Description
limit
integer
(query)
Default value : 50

50
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"message": "string",
"admin_reply": "string",
"admin_replied_at": "2026-01-08T13:36:59.667Z",
"created_at": "2026-01-08T13:36:59.667Z"
}
]
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links
Announcements

GET
/announcements
Get Announcements

Get all active announcements

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"title": "string",
"content": "string",
"is_active": true,
"created_at": "2026-01-08T13:36:59.669Z"
}
]
No links
Admin

GET
/sageadmin/mining-circles
Get Mining Circles

Get all mining circles

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"start_time": "2026-01-08T13:36:59.671Z",
"end_time": "2026-01-08T13:36:59.671Z",
"token_reward_rate": 0,
"is_active": true,
"created_at": "2026-01-08T13:36:59.671Z"
}
]
No links

POST
/sageadmin/mining-circles
Create Mining Circle Endpoint

Create a new mining circle

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"start_time": "2026-01-08T13:36:59.674Z",
"end_time": "2026-01-08T13:36:59.674Z",
"token_reward_rate": 1
}
Responses
Code Description Links
201
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"start_time": "2026-01-08T13:36:59.676Z",
"end_time": "2026-01-08T13:36:59.676Z",
"token_reward_rate": 0,
"is_active": true,
"created_at": "2026-01-08T13:36:59.676Z"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/sageadmin/tasks
Get All Tasks

Get all tasks

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"title": "string",
"description": "string",
"task_type": "admob",
"reward_amount": 0,
"is_active": true,
"created_at": "2026-01-08T13:36:59.679Z",
"is_completed": true
}
]
No links

POST
/sageadmin/tasks
Create Task Endpoint

Create a new task

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"title": "string",
"description": "string",
"task_type": "admob",
"reward_amount": 1
}
Responses
Code Description Links
201
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"title": "string",
"description": "string",
"task_type": "admob",
"reward_amount": 0,
"is_active": true,
"created_at": "2026-01-08T13:36:59.683Z",
"is_completed": true
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/sageadmin/announcements
Get All Announcements

Get all announcements

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"title": "string",
"content": "string",
"is_active": true,
"created_at": "2026-01-08T13:36:59.686Z"
}
]
No links

POST
/sageadmin/announcements
Create Announcement Endpoint

Create a new announcement

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"title": "string",
"content": "string"
}
Responses
Code Description Links
201
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"title": "string",
"content": "string",
"is_active": true,
"created_at": "2026-01-08T13:36:59.689Z"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/sageadmin/settings
Get Settings Endpoint

Get system settings

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"referral_reward": 0,
"sage_usd_rate": 0,
"min_withdrawal_amount": 0
}
No links

PUT
/sageadmin/settings
Update Settings Endpoint

Update system settings

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"referral_reward": 0,
"sage_usd_rate": 0,
"min_withdrawal_amount": 0
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"referral_reward": 0,
"sage_usd_rate": 0,
"min_withdrawal_amount": 0
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/sageadmin/users
Get All Users Endpoint

Get all users

Parameters
Try it out
Name Description
limit
integer
(query)
Default value : 100

100
offset
integer
(query)
Default value : 0

0
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"email": "string",
"wallet_address": "string",
"token_balance": 0,
"total_earned": 0,
"created_at": "2026-01-08T13:36:59.700Z"
}
]
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/sageadmin/withdrawals
Get All Withdrawals Endpoint

Get all withdrawals

Parameters
Try it out
Name Description
status
string | (string | null)
(query)
status
limit
integer
(query)
Default value : 100

100
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"amount": 0,
"wallet_address": "string",
"status": "pending",
"created_at": "2026-01-08T13:36:59.704Z"
}
]
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

PUT
/sageadmin/withdrawals/{withdrawal_id}
Update Withdrawal Endpoint

Update withdrawal status

Parameters
Try it out
Name Description
withdrawal_id \*
integer
(path)
withdrawal_id
Request body

application/json
Example Value
Schema
{
"status": "pending",
"admin_notes": "string"
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"amount": 0,
"wallet_address": "string",
"status": "pending",
"created_at": "2026-01-08T13:36:59.709Z"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links

GET
/sageadmin/chat/messages
Get All Chat Messages

Get all chat messages (admin view)

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"message": "string",
"admin_reply": "string",
"admin_replied_at": "2026-01-08T13:36:59.713Z",
"created_at": "2026-01-08T13:36:59.713Z"
}
]
No links

GET
/sageadmin/chat/unreplied
Get Unreplied Messages

Get all unreplied messages

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
[
{
"id": 0,
"message": "string",
"admin_reply": "string",
"admin_replied_at": "2026-01-08T13:36:59.715Z",
"created_at": "2026-01-08T13:36:59.715Z"
}
]
No links

POST
/sageadmin/chat/reply
Reply To Chat Message

Reply to a user message

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
"message_id": 0,
"admin_reply": "string"
}
Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
"id": 0,
"message": "string",
"admin_reply": "string",
"admin_replied_at": "2026-01-08T13:36:59.719Z",
"created_at": "2026-01-08T13:36:59.719Z"
}
No links
422
Validation Error

Media type

application/json
Example Value
Schema
{
"detail": [
{
"loc": [
"string",
0
],
"msg": "string",
"type": "string"
}
]
}
No links
default

GET
/
Root

Root endpoint

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links

GET
/health
Health Check

Health check endpoint

Parameters
Try it out
No parameters

Responses
Code Description Links
200
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links

Schemas
ActiveMiningSessionResponseCollapse allobject
is_activeboolean
mining_circle_idCollapse all(integer | null)
Any ofCollapse all(integer | null)
#0integer
#1null
start_timeCollapse all(string | null)
Any ofCollapse all(string | null)
#0stringdate-time
#1null
end_timeCollapse all(string | null)
Any ofCollapse all(string | null)
#0stringdate-time
#1null
duration_secondsCollapse all(integer | null)
Any ofCollapse all(integer | null)
#0integer
#1null
token_reward_rateCollapse all(number | null)
Any ofCollapse all(number | null)
#0number
#1null
can_startCollapse allboolean
Defaultfalse
messageCollapse all(string | null)
Any ofCollapse all(string | null)
#0string
#1null
AdminLoginCollapse allobject
usernamestring
passwordstring
AdminResponseCollapse allobject
idinteger
usernamestring
created_atstringdate-time
AdminTokenResponseCollapse allobject
access_tokenstring
token_typeCollapse allstring
Default"bearer"
adminCollapse allobject
idinteger
usernamestring
created_atstringdate-time
AnnouncementResponseCollapse allobject
idinteger
titlestring
contentstring
is_activeboolean
created_atstringdate-time
BoostCompleteRequestCollapse allobject
session_idinteger
BoostCompleteResponseCollapse allobject
successboolean
boost_countinteger
time_added_secondsinteger
new_end_timeExpand all(string | null)
messagestring
ChatMessageRequestCollapse allobject
messagestring[1, 1000] characters
ChatMessageResponseCollapse allobject
idinteger
messagestring
admin_replyExpand all(string | null)
admin_replied_atExpand all(string | null)
created_atstringdate-time
CompleteMiningRequestCollapse allobject
session_idinteger
CompleteMiningResponseCollapse allobject
successboolean
tokens_earnednumber
new_balancenumber
messagestring
CompleteTaskRequestCollapse allobject
task_idinteger
CompleteTaskResponseCollapse allobject
successboolean
reward_claimednumber
new_balancenumber
messagestring
CreateAnnouncementRequestCollapse allobject
titlestring
contentstring
CreateMiningCircleRequestCollapse allobject
start_timestringdate-time
end_timestringdate-time
token_reward_ratenumber> 0
CreateTaskRequestCollapse allobject
titlestring
descriptionCollapse all(string | null)
Any ofCollapse all(string | null)
#0string
#1null
task_typeCollapse allstring
EnumCollapse allarray
#0"admob"
#1"social"
#2"content"
reward_amountnumber> 0
ExchangeRateResponseCollapse allobject
sage_usd_ratenumber
updated_atExpand all(string | null)
HTTPValidationErrorCollapse allobject
detailCollapse allarray<object>
ItemsCollapse allobject
locCollapse allarray<(string | integer)>
ItemsCollapse all(string | integer)
Any ofCollapse all(string | integer)
#0string
#1integer
msgstring
typestring
MiningCircleResponseCollapse allobject
idinteger
start_timestringdate-time
end_timestringdate-time
token_reward_ratenumber
is_activeboolean
created_atstringdate-time
NotificationCountResponseCollapse allobject
unread_countinteger
NotificationResponseCollapse allobject
idinteger
notification_typeCollapse allstring
EnumCollapse allarray
#0"mining_circle"
#1"new_task"
#2"referral_success"
#3"chat_message"
#4"withdrawal_status"
#5"announcement"
titlestring
messagestring
is_readboolean
created_atstringdate-time
NotificationTypeCollapse allstring
EnumCollapse allarray
#0"mining_circle"
#1"new_task"
#2"referral_success"
#3"chat_message"
#4"withdrawal_status"
#5"announcement"
ReferralStatsResponseCollapse allobject
referral_codestring
total_referralsinteger
total_rewards_earnednumber
ReplyChatRequestCollapse allobject
message_idinteger
admin_replystring[1, 1000] characters
SettingsResponseCollapse allobject
referral_rewardnumber
sage_usd_ratenumber
min_withdrawal_amountnumber
StartMiningResponseCollapse allobject
successboolean
session_idinteger
start_timestringdate-time
end_timestringdate-time
duration_secondsinteger
token_reward_ratenumber
messagestring
TaskResponseCollapse allobject
idinteger
titlestring
descriptionCollapse all(string | null)
Any ofCollapse all(string | null)
#0string
#1null
task_typeCollapse allstring
EnumCollapse allarray
#0"admob"
#1"social"
#2"content"
reward_amountnumber
is_activeboolean
created_atstringdate-time
is_completedCollapse all(boolean | null)
Any ofCollapse all(boolean | null)
#0boolean
#1null
TaskTypeCollapse allstring
EnumExpand allarray
TokenResponseCollapse allobject
access_tokenstring
token_typeExpand allstring
userExpand allobject
UpdateSettingsRequestCollapse allobject
referral_rewardExpand all(number | null)
sage_usd_rateExpand all(number | null)
min_withdrawal_amountExpand all(number | null)
UpdateWithdrawalRequestCollapse allobject
statusExpand allstring
admin_notesExpand all(string | null)
UserListResponseCollapse allobject
idinteger
emailstring
wallet_addressExpand all(string | null)
token_balancenumber
total_earnednumber
created_atstringdate-time
UserLoginCollapse allobject
emailstringemail
passwordstring
UserRegisterCollapse allobject
emailstringemail
passwordstring≥ 6 characters
wallet_addressCollapse all(string | null)
Any ofCollapse all(string | null)
#0string
#1null
referral_codeCollapse all(string | null)
Any ofCollapse all(string | null)
#0string
#1null
cookies_enabledCollapse allboolean
Defaulttrue
privacy_acceptedCollapse allboolean
Defaultfalse
UserResponseCollapse allobject
idinteger
emailstring
wallet_addressExpand all(string | null)
referral_codestring
token_balancenumber
total_earnednumber
boost_countinteger
created_atstringdate-time
ValidationErrorCollapse allobject
locExpand allarray<(string | integer)>
msgstring
typestring
WithdrawalRequestCollapse allobject
amountnumber> 0
wallet_addressstring
WithdrawalResponseCollapse allobject
idinteger
amountnumber
wallet_addressstring
statusExpand allstring
created_atstringdate-time
WithdrawalStatusCollapse allstring
EnumExpand allarray
