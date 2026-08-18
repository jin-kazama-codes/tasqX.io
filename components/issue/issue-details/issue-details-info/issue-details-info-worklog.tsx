import React, { useCallback, useEffect, useState } from 'react'
import WorklogDlt from '@/components/modals/worklogdelete';
import EditWorklog from '@/components/modals/editworklog';
import { calculateTimeLogged } from '@/utils/helpers';
import { useCookie } from '@/hooks/use-cookie';
import { useWorklog } from '@/hooks/query-hooks/use-worklog';



interface WorklogEntry {
  issueId: string;
  userName: string;
  timeLogged: string;
  workDescription: string;
}

interface Issue {
  id: string;
}

interface WorklogProps {
  issue: Issue | null;
}

const Worklog: React.FC<WorklogProps> = ({ issue }) => {
  const Username = useCookie('user')?.name;
  const {worklogs, worklogsLoading} = useWorklog(issue?.id)

  return (
    <div className='mt-2 flex flex-col gap-y-2'>
      <h2 className="dark:text-dark-50">Worklogs</h2>
      {worklogsLoading ? (
        <div className="mt-2 space-y-2">
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      ) : worklogs.length > 0 ? (
        worklogs.map((worklog, index) => (
          <div className='dark:bg-darkSprint-50 rounded-xl p-3 mb-3'>
            <div className='flex space-x-1.5 items-center' key={index + 1}>
              <p className="font-bold text-xm text-black "> {worklog.userName}</p>
              <p className='text-sm font-medium text-gray-800 dark:text-darkSprint-0'>Logged <span className="font-bold text-black"> {worklog.timeLogged}</span> </p>
              <p className='text-sm font-medium pl-2 text-gray-800 dark:text-darkSprint-0'>{calculateTimeLogged(worklog.createdAt)} Ago</p>
            </div>
            <div className='text-base p-3 dark:text-darkSprint-0'> {worklog.workDescription} </div>
            {worklog.userName === Username && (<div className='flex space-x-2 items-center font-bold'>
              <EditWorklog
                issue={issue}
                worklog={worklog}
              >
                <button className="bg-transparent text-sm font-bold text-gray-800 underline-offset-2 hover:underline"
                >Edit</button>
              </EditWorklog>
              <WorklogDlt
                worklog={worklog}>
                <button
                  className='bg-transparent text-sm  font-bold text-gray-800 underline-offset-2 hover:underline'
                >Delete</button>
              </WorklogDlt>
            </div>)}
          </div>
        ))
      ) : (
        <p className='mb-4 dark:text-dark-50'>No worklog entries found.</p>
      )}

    </div>

  );
};

export default Worklog;
