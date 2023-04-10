import React from 'react';

const Error = () => {
  return (
    <div className="page-error-wrapper min-h-screen grid place-content-center p-[30px]">
      <div className="text-center"><h1
        className="text-[100px] font-bold leading-[0.7] text-red-500 border-b-2 border-b-gray-600 sm:text-[130px]">500</h1><h5
        className="sm:text-2xl font-normal text-body">Internal server Error.</h5><p
        className="mb-[50px]">You may have mistyped the address or the page may have moved.</p>
        <p className="mb-0 text-xs text-gray-600">© Copyright
        2023. All Rights Reserved. TripZin.</p></div>
    </div>
  )
};

export default Error;
