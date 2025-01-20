import React from 'react'

import packageJson from '../../package.json'

const AppVersion = () => {
  return <p className="app">AppVersion: VSky v{packageJson.version}</p>
}

export default AppVersion
