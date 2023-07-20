/*
 * Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export default {
  router: {
    home_main: 'Home',
    home_file: 'Files',
    me_recycle_bin: 'Recycle Bin',
    my_setting: 'Mine',
    device: 'Device',
    ao_space: 'AO.space'
  },
  buttons: {
    common_save: 'Save',
    common_edit: 'Edit',
    common_ok: 'Confirm',
    common_confirm: 'Confirm',
    common_cancel: 'Cancel',
    common_select_all: 'Select All',
    common_delete: 'Delete',
    common_more: 'More',
    common_next: 'Next',
    common_copy: 'Copy',
    common_open: 'Open',
    common_move: 'Move',
    common_rename: 'Rename',
    common_detail: 'Details',
    common_cancel_check: 'Deselect',
    common_download: 'Download',
    common_search: 'Please enter the search content',
    common_upload_file: 'File',
    common_upload_folder: 'Folder',
    create_folder: 'Folder',
    more_help: 'Help Center',
    more_download: 'Download Client',
    more_language: 'Language',
    more_logout: 'Log Out',
    file_clear: 'Clear',
    file_reduction: 'Restore',
    help: 'Help',
    last_step: 'Previous Step',
    next_step: 'Next Step',
    verification: 'Validation',
    close: 'Close'
  },
  notify: {
    notify_title: 'Message Center',
    notify_clear: 'Clear',
    nodata: 'No Message',

    logout_desc:
      'Your login has expired. If you need to log in again, please scan the code for authorization',
    member_delete_desc:
      'Your AO.space has been logged out and cannot be used any more. Please contact the administrator.',
    restore_success_desc:
      'Your AO.space data has been recovered. If you have any questions, please contact the administrator.',
    member_self_delete: 'AO.space Logout',
    revoke: 'Offline Notification',
    restore_success: 'Data recovery completed',

    uninstall: 'Uninstall Notification',
    uninstall_desc:
      'The administrator has uninstalled the app [{appName}], and you will not be able to continue using it. If you have any questions, please contact the administrator',
    memories_desc: 'Ao.space helped you sort out some past memories. Go to review them~',

    many_files: '{name} and other {count} files',
    wait_execution: 'Wait',
    opera_fail: 'Fail',
    opera_suc: 'Success',

    create: 'New Folder',
    move: 'Move',
    delete: 'Delete',
    rename: 'Rename',
    copy: 'Copy',
    restore: 'Restore from Recycle Bin',
    clear_restore: 'Empty recycle Bin',

    message_title:
      'Display all terminal information of the logged in space. It is recommended that you perform offline operations on unfamiliar terminals to prevent privacy leakage. Terminals that have been offline can still scan the code again to authorize login.',
    loading: 'Loading'
  },
  breadcrumb: {
    select_files: '{count} file has been selected | {count} files have been selected'
  },
  space: {
    home_photo: 'Photos',
    home_all: 'All',
    home_myspace: 'My Space',
    home_video: 'Videos',
    home_document: 'Documents',
    home_other: 'Other',
    file_name: 'File Name',
    modify_time: 'Modify Time',
    upload: 'Upload',
    select_folder: 'Select Folder',
    size: 'Size',
    location: 'Location',
    detail_info: 'Detailed Information',
    file_drag_upload: 'File can be uploaded by dragging in',
    not_contain: 'No content containing ',
    contain_file: ' was found',
    delete_file: 'Delete File | Delete Files',
    delete_content: 'Are you sure to delete {name} ？',
    delete_success: 'Delete Success',
    delete_fail: 'Delete Fail',
    folder: 'Folder',
    file_name_only: 'The file name only supports Chinese, English, numbers and underscores',
    rename_success: 'Rename Success',
    rename_fail: 'Rename Fail',
    create_success: 'Create Success',
    create_fail: 'Create Fail',
    copy_fail_contains: 'Copy fail, destination directory already contains {name}',
    move_fail_contains: 'Move fail, destination directory already contains {name}',
    move_suc: 'Move Success',
    move_fail: 'Move Fail',
    move_fail_self: 'Cannot move folder below itself ！！！',
    copy_suc: 'Copy Success',
    copy_fail: 'Copy Fail',
    view_details: 'View Details',
    task_list: 'Task Queue',
    preview_support: 'Preview is not Supported',
    file_recycle_bin: 'Are you sure to move {name} to the Recycle Bin?',
    file_recycle_bins: 'Are you sure to move these files to the Recycle Bin?',
    file_del: 'Deleting'
  },
  recycle: {
    delete_time: 'Delete Time',
    recycle_nodata: 'No files to recycle',
    clear_desc: 'Are you sure to empty the recycle bin?',
    clear_success: 'Emptying Succeeded',
    clear_fail: 'Empty Failed',
    del_desc:
      'Are you sure to delete {name} completely？ | Are you sure to delete these files completely?',
    del_success: 'Delete Succeeded',
    del_fail: 'Delete Failed',
    restore_desc: 'Are you sure to restore {name}？ | Are you sure to restore these files？',
    restore_success: 'Restore Succeeded',
    restore_fail: 'Restore Failed',
    restoring: 'Restoring'
  },
  index: {
    time_yesterday: 'Yesterday'
  },
  share: {
    video_preview: 'Video preview is temporarily not supported'
  },
  album: {
    memories: 'Memories'
  },
  setting: {
    lan:"LAN",
    wlan:'Internet',
    person_info: 'Space Details',
    person_icon: 'Profile Photo',
    nick_name: 'Space Name',
    signature: 'Personalized Signature',
    name_tips: 'Please enter your Space ID, maximum 24 characters',
    signature_tips:
      'Introduce yourself in one paragraph, which will be displayed on your profile page.',
    space_channel: 'Space Channel',
    domain_name: 'Domain Name',
    domain_name_tips: '* Domain name can only be edited on bound mobile phones.',
    change_avatar: 'Change Avatar',
    select_picture: 'Select Picture',
    avatar_preview: 'Avatar Preview',

    family: 'Family',
    memberId: 'Member ID',
    used_space: 'Used Space',
    bound_phone: 'Bound Phone',

    product_mode: 'Product Model Number',
    product_sn: 'SN Code',
    total: 'Total',
    used: 'Used',
    unused: 'Unused',
    bound_device: 'Bound Device',
    current_device: 'Current Device',

    terminal_desc:
      'Displays information about all devices that have logged in to the space. You are advised to log unfamiliar devices offline to prevent privacy leakage. The offline devices can still scan codes for authorization to log in.',
    ip_reference: '* IP dependencies for reference only',
    terminal_name: 'Device Name',
    terminal_type: 'Device Type',
    login_location: 'Location',
    login_last_time: 'Last Login Time',
    operation: 'Operation',
    offline: 'Offline',

    security: 'Security',
    security_desc:
      'When you reset the security passcode on the new phone, the secret email is used to verify that you are responsible for the operation, to ensure the security of your data.',
    security_email: 'Secure Mailbox',
    change_email: 'Modify Email',
    unbound: 'Unbound',
    binding: 'Bind',
    password: 'Secure Passcode',
    set: 'Set',
    change_password: 'Modify',

    offline_terminal: 'Offline Terminal',
    offline_confirm: 'Are you sure you want to offline the terminal?',
    offline_success: 'Operation Succeeded',
    offline_fail: 'Operation Failed, error reason: {error}',
    space_id_error: 'The space ID is duplicate, please re-enter',
    open_source:"Open Source Version", 
  },
  safe: {
    mail_desc:
      'Please enter the mailbox account and passcode to bind for login verification. Pride space does not store your secret mailbox passcode, it is only used for login verification.',
    old_mail: 'Original Secret Mailbox Verification',
    already_bound:
      'You have already bound secret mailbox {emailHiddenAccount}. Please enter your secret mailbox account and passcode for login verification. Pride space does not store your secret mailbox password, it is only used for login verification.',
    rebound_email: 'Rebind Security Mailbox',
    email_account: 'Email',
    email_password: 'Passcode',
    app_password_tip: 'Apply Passcode/Authorization Passcode',
    manual_setting: 'Manual Setup',
    smtp_server: 'SMTP Server',
    smtp_port: 'Port',
    safe_type: 'Security Type',
    password_desc:
      'The security passcode is 6 digits and can only be set and modified by the administrator. Please keep this passcode carefully.',
    old_password: 'Original Passcode',
    new_password: 'New Passcode',
    password_tip: 'Six-digit Security Passcode',
    repeat_password: 'Repeat New Passcode',
    repeat_tip: 'Fill in again for confirmation',
    forgot_password: 'Forgot Passcode',
    safe_password_val: 'Secure Passcode Verification',
    app_scenarios: 'Application Scenario',
    unbound_device:
      'Unbind the device. The administrator must enter the correct security passcode to complete the unbind operation.',
    admin_val:
      "Other situations where a security passcode is required to verify the administrator's identity.",
    val_choose: 'AO.space needs to verify your identity, please choose the authentication method',
    choose_one: 'Mode One',
    choose_email: 'Original Secret Mailbox Verification',
    choose_two: 'Mode Two',
    please_confirm: 'Please confirm on the bound phone',
    bound_phone_error: 'Binding phone is not available',
    password_error: 'Wrong passcode, please try again in 1 minute',
    cannot_opa: 'Unable to Complete Operation',
    admin_cannot: 'Reason: Administrator binding side could not confirm',
    bound_new_phone:
      'Please complete the Bind Device on your new phone before operating to change the full passcode',
    bound_reject: 'Reason: The administrator rejected this operation on the binding side',
    unbound_email: 'Reason: The security mailbox is not bound',
    reset_desc:
      'You can reset the security passcode on a bound or authorized mobile phone by using an unclassified mailbox',
    opa_timeout: 'Reason: The operation timed out, please restart',
    request_times: 'Reason: Too many requests, please try again in 10 minutes',

    bound_email: 'Bind the secret mailbox',
    change_email: 'Replace Secret Mailbox',
    change_password: 'Modify Security Passcode',
    email_format_error: 'Mailbox Format Error',
    please_email: 'Please fill in the email passcode',
    please_server: 'Please fill in the server configuration',
    val_tip: 'Verifying, Please Wait...',
    bound_email_success: 'Bound Secure Mailbox Success',
    change_email_success: 'Modify Secure Mailbox Success',
    already_bound_error: 'You have bound this mailbox, please enter a new mailbox account',
    email_error: 'Verification failed, account or passcode error',
    email_timeout: 'Mailbox validation timeout',
    email_format: 'Mailbox format error',
    request_fail: 'The request failed. Please try again later',
    password_only_tip: 'Passcode must be 6 digits',
    password_match: 'The new passcode is inconsistent',
    change_password_suc: 'Passcode changed Success',
    old_password_err: 'The original passcode is incorrect',
    password_re_input:
      'The new passcode cannot be the same as the original passcode, please re-enter',
    reset_password_suc: 'Passcode reset succeeded',
    password_error_num: 'Wrong passcode,{count} chance left'
  },
  downUpload: {
    download_detail: 'Download Details',
    upload_detail: 'Upload Details',
    no_task: 'No Task',
    network: 'Current Network',
    network_lan: 'LAN Direct Connection',
    network_wan: 'Internet Forwarding',
    network_offline: 'Offline',
    close_tip: 'There are unfinished files. Confirm to leave?',
    file_already_in:
      'Files such as {file} are already in the download list. Please check in the download list',
    folder_limit:
      'The folder level where {file} is located and the folder level where it is uploaded together exceed {count} levels. Please re-select',

    state_pause: 'Paused',
    down_wait: 'Download Waiting',
    down_download: 'Downloading...',
    down_complete: 'Download Completed',
    down_fail: 'Download Fail',
    upload_wait: 'Upload Waiting...',
    upload_download: 'Uploading...',
    upload_complete: 'Upload Completed',
    upload_fail: 'Upload Fail',
    down_start: 'downloading...',
    insufficient: '(Insufficient Space)',
    no_exist: 'The file has been deleted or moved. Please refresh and try again'
  },
  login: {
    other_login: 'Other Login',
    version: 'AO.space App - Home Page - Scan',
    scan_code: 'Scan Code Login',
    please_use_phone: 'Please use {app} Scan Code Login',
    use_scan: 'Please use {app} Scan Code Login',
    web_needs: 'Web of AO.space needs to be used with mobile phones',
    privacy: 'Privacy Policy',
    user: 'User Agreement',
    code: 'Please enter the authorization code',
    copyright: 'Copyright © 2022-2023 Nanjing Institute of Software Technology',
    enter: 'Enter AO.space',
    more: 'Sign in for more AO.space',
    auto: "'s AO.space",
    cancel: 'Cancel Logon',
    confirm: 'Please confirm login on the bound phone',
    codeError: 'Authorization code error, please re-enter',
    error_times: 'Too many errors, please try again later',
    auth_code_help: 'How to view authorization codes',
    phone_show_code: 'Please enter the {num}-digit authorization code displayed on your phone',
    domain_login: 'Domain / Space Login',
    input_domain: 'Please enter the domain name / space ID',
    domain_name: 'Example: ***. ao.space or Xiao Ao***',
    space_not_found: 'The space ID not exist. Please check if the input is correct',
    space_not_found_mobile:
      'The space ID not exist. <br/>Please check <br/> if the input is correct',
    space_id_duplicate:
      'Login failed. The space ID is duplicate. Please edit the space ID or login using a domain name',
    switchLan: 'Do you want to switch to LAN and experience faster speeds?',
    switchWan:
      'The LAN is not available. Do you want to switch to the internet to continue using it?',
    switchNow: 'Switch Now'
  },
  error: {
    unknown: 'Unknown error',
    number: 'Authorization number error',
    bkey: 'Bkey error',
    network: 'Network error',
    offline: 'The terminal is offline',
    offline_notify: 'Device offline, please check the device or network condition',
    service_exception: 'Service exception, please try again later'
  }
}
