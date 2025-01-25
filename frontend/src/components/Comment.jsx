import { Avatar } from '@radix-ui/react-avatar'
import React from 'react'
import { AvatarFallback, AvatarImage } from './ui/avatar'

function Comment({comment}) {

  return (
    <div className='my-2'>
         <div className='flex gap-3 items-center'>
        <Avatar>
            <AvatarImage src={comment?.author?.profilePicture} className="rounded-full h-5 w-5"/>
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className='font-bold text-sm'>{comment?.author?.userName} <span className='font-normal pl-1'>{comment?.text}</span></h1>
      </div>
    </div>
  )
}

export default Comment
