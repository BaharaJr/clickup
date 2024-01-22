import * as core from '@actions/core'

const CLICKUP_TOKEN = core.getInput('CLICKUP_TOKEN')
const LIST_ID = core.getInput('LIST_ID')
let MESSAGE = core.getInput('MESSAGE')
const ASSIGNEES = core.getInput('ASSIGNEES')
const STATUS = core.getInput('TASK_STATUS') || 'DONE'
const CLICKUP_API = 'https://api.clickup.com/api/v2/list'

const milliseconds = () => {
  const minMilliseconds = 30 * 60 * 1000 // 30 minutes
  const maxMilliseconds = 3 * 60 * 60 * 1000 // 3 hours
  return (
    Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) +
    minMilliseconds
  )
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export const run = async (): Promise<void> => {
  try {
    if (MESSAGE.includes(':')) {
      MESSAGE = MESSAGE.split(':')[1]
    }
    const body = JSON.stringify({
      name: MESSAGE,
      description: MESSAGE,
      markdown_description: MESSAGE,
      assignees: (ASSIGNEES || '').split(',').map(assignee => Number(assignee)),
      status: STATUS,
      priority: 2,
      due_date: new Date().valueOf(),
      due_date_time: false,
      time_estimate: milliseconds(),
      start_date: Date.now() - 2 * 60 * 60 * 1000,
      start_date_time: false
    })

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Authorization', CLICKUP_TOKEN)

    await fetch(`${CLICKUP_API}/${LIST_ID}/task`, {
      method: 'POST',
      headers: headers,
      body
    })

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
