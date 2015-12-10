import { exec } from 'shelljs'

export const commitTag = () => {
  let cmd = "git show|head -n1|awk '{print $2}'|cut -c -8"
  return exec(cmd, {silent: true}).output.replace(/\n/, '')
}
