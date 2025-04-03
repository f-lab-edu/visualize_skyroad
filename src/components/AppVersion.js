import React from 'react';
import packageJson from '../../package.json';
const AppVersion = () => {
    return React.createElement("p", { className: "app" },
        "AppVersion: VSky v",
        packageJson.version);
};
export default AppVersion;
