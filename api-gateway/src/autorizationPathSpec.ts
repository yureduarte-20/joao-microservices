import { HTPP_METHODS, PathSpec, Roles, Services } from "./types";

export const PATHS: PathSpec[] = [
    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR, Roles.STUDENT],
        pathName: /^\/users/,
        service: Services.USER_SERVICE,
        method: [HTPP_METHODS.GET],
        onlyOnwer: false,
        hasParamId:false
    },
    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR, Roles.STUDENT],
        pathName: /^\/users\/[0-f]+/,
        service: Services.USER_SERVICE,
        method: [HTPP_METHODS.GET],
        onlyOnwer:false,
        hasParamId:true
    },
    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR, Roles.STUDENT],
        pathName: /^\/users\/[0-f]+/,
        service: Services.USER_SERVICE,
        method: [HTPP_METHODS.DELETE, HTPP_METHODS.PATCH, HTPP_METHODS.PUT],
        onlyOnwer:true,
        hasParamId: true
    },
    {
        allowedRoles: [Roles.ADMIN],
        pathName: /^\/admin\/*./,
        method: [HTPP_METHODS.PATCH, HTPP_METHODS.GET, HTPP_METHODS.DELETE, HTPP_METHODS.POST, HTPP_METHODS.PUT],
        service: Services.USER_SERVICE,
        onlyOnwer:false,
        hasParamId:false
    },
    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR, Roles.STUDENT],
        pathName: /^\/problems\/*./,
        method: [HTPP_METHODS.GET],
        service: Services.USER_SERVICE,
        onlyOnwer:false,
        hasParamId:false
    },

    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR],
        pathName: /^\/advisor\/doubts\/subscribe\/[0-f]+$/,
        method: [HTPP_METHODS.POST],
        service: Services.CHAT_SERVICE,
        onlyOnwer:false,
        hasParamId:true
    },
    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR],
        pathName: /^\/advisor\/doubts\/*.*/,
        method: [HTPP_METHODS.GET],
        service: Services.CHAT_SERVICE,
        onlyOnwer:false,
        hasParamId:false
    },
    {
        allowedRoles: [Roles.ADMIN, Roles.ADVISOR],
        pathName: /^\/advisor\/problems\/*/,
        method: [HTPP_METHODS.GET],
        service: Services.PROBLEM_SERVICE,
        onlyOnwer:false,
        hasParamId:false
    },

    
]