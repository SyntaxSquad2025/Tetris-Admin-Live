export const ADMIN_SIGNUP = `/adminsignup`
export const ADMIN_LOGIN = `/adminlogin`
export const GET_ALL_USERS = `/admingetallusers`
export const EDIT_PROFILE = (userId) => `/admineditprofile/${userId}`
export const GET_PROFILE = (userId) => `/admingetprofile/${userId}`
export const SET_DAILY_REWARD = `/setdailyReward`
export const GET_ALL_DAILY_REWARD = `/getalldailyreward`
export const APPROVE_WITHDRAW = `/approveWithdraw`
export const REJECT_WITHDRAW = `/rejectWithdraw`
export const GET_ALL_WITHDRAWALS = `/getallwithdrawstatus`
export const ADD_TASK = `/addtask`
export const UPDATE_TASK = `/updatetask/admin`
export const GET_SINGLE_TASK = (taskId) => `/getsingletask/admin/${taskId}`
export const GET_TASK = `/gettasks/admin`
export const CHANGE_PASSWORD = `/changepassword`
export const FORGOT_PASSWORD = `/forgotPassword`
export const RESET_PASSWORD = `/resetPassword`
export const ADMIN_LOGOUT = `/adminLogout`
export const TOTAL_GAME_HISTORY = `/totalgamehistory`
export const ADD_AD = `/addAdUpdateAd`
export const UPDATE_AD = `/addAdUpdateAd`
export const GET_AD_BY_ID = (adId) => `/getads/${adId}`
export const GET_ALL_ADS = `/getads`
export const GET_COMPLETED_TASKS_BY_USER = `/getCompletedTasksByUser`
export const GET_COMPLETED_ADS_BY_USER = `/getCompletedAdsByUser`
export const GET_ALL_CLAIM_HISTORY = `/getAllClaimHistory`
export const CREATE_GAME = `/creategame`
export const UPDATE_GAME = `/gameUpdate`
export const GET_ALL_LEVELS = `/gettotalgames`
export const GET_ALL_REFERRALS = `/getreferralHistory`
export const ANNOUNCEMENT = `/sendNotificationToAllUsers`
export const ADMIN_SET_REFERRAL_REWARD = `/set-referral-reward`
export const GET_WITHDRAWAL_LIMITS = `/getWithdrawLimits`
export const CREATE_WITHDRAW_LIMITS = `/CreateWithdrawLimits`
export const UPDATE_WITHDRAW_LIMITS = `/updateWithdrawLimits`
export const GET_TICKET = `/getTicketConvertion`
export const UPDATE_TICKET = `/updateTickets`
export const GET_WITHDRAWAL_METHODS = `/transferWithdraw`
export const GET_REFERRAL_REWARD = `/admin/referral-rewards`
export const DASHBOARD = `/dashboard`
export const SEARCH = `/searchRecords`
export const GET_USER_HISTORY = `/user/history`
export const GET_USER_PROFILE = `/getuserprofile`

// ============================================
export const CREATE_GAME_LEVEL = `/gamelevelcontroller`
export const UPDATE_GAME_LEVEL = `/gamelevelupdate`
export const GET_SINGLE_LEVEL = (gameId) => `/getsinglelevel/${gameId}`
export const ADD_BOOSTER = `/addBooster`
export const UPDATE_BOOSTER = `/updateBooster`
export const GET_ALL_BOOSTERS = `/getAllBoosters`
export const BOOSTER_SETTING = `/addboostersetting`
export const UPDATE_BOOSTER_SETTING = `/updateboostersetting`
export const GET_BOOSTER_SETTING = `/getadminBoosterSetting`
export const GET_BOOSTER_TRANSACTIONS = `/getboosterTransactions`

