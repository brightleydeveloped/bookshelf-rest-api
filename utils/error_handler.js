var generateError = function (code, msg) {
    var error = new Error(msg);
    error.status = code;
    return error;
};

/**
 * These all return 200 -- cors was having issues when they weren't 200
 * Responding 200 allows the json message to go through regardless of error code
 */
module.exports = {
    generateError: generateError,
    RequiredIDOrEmail: function () {
        return generateError(200, 'Email of existing user required to save role.');
    },
    PasswordIncorrect: function () {
        return generateError(200, 'Invalid email or password.');
    },
    UserExists: function () {
        return generateError(200, 'User with the same email address already exists.')
    },
    UserLocked: function () {
        return generateError(200, 'Account has been locked due to too many incorrect login attempts.')
    },
    InvalidEmail: function () {
        return generateError(200, 'Invalid email.  Please provide valid email address.');
    },
    InvalidRole: function () {
        return generateError(200, 'Invalid role to grant to user');
    },
    InvalidPassword: function () {
        return generateError(200, 'Invalid password.  Please provide valid password.');
    },
    UnauthorizedAccess: function () {
        return generateError(200, "Invalid authorization headers.")
    },
    ExpiredToken: function () {
        return generateError(200, "Token is expired");
    },
    UserInactive: function () {
        return generateError(200, 'User has been flagged as inactive. Please contact an administrator.')
    },
    PermissionDenied: function () {
        return generateError(200, "Permission to access resource denied");
    },
    Exists: function (name) {
        name = name || 'entity';
        return generateError(200, "This " + name + " already exists");
    },
    FileNameRequired: function () {
        return generateError(200, "file_name is required to upload a file");
    },
    FileTypeRequired: function () {
        return generateError(200, "file_type is required to upload a file");
    },
    NoFilesFound: function () {
        return generateError(200, "No files found in request payload.");
    },
    SignatureDoesNotMatch: function () {
        return generateError(200, 'Signature does not match');
    },
    SignatureExpired: function () {
        return generateError(200, 'Signature is expired');
    },
    ResourceTypeMustBeLicenseOrProject: function () {
        return generateError(200, 'resource_type must be client, license or project');
    },
    ResourceIdRequired: function () {
        return generateError(200, 'resource_id is required')
    },
    ResourceDoesNotExist: function (msg) {
        return generateError(200, msg || 'Resource does not exist');
    },
    NoConfigurationsFound: function () {
        return generateError(200, 'No configurations for playlist found.');
    },
    ActionDoesNotExist: function (msg) {
        return generateError(200, `Action does not exist.`);
    }
};
