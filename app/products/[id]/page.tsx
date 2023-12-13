import React from 'react'


type Props = {
  params: { id: string }
}

const Prouctdetails = async ({ params: { id } }: Props) => {
  return (
    <div>{id} </div>
  )
}

export default Prouctdetails;