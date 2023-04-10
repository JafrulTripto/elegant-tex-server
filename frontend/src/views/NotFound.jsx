export default function NotFound() {
  return (
    <div className="page-error-wrapper min-h-screen grid place-content-center p-[30px]">
      <div className="text-center"><h1
        className="text-[100px] font-bold leading-[0.7] text-red-500 border-b-2 border-b-gray-600 sm:text-[130px]">404</h1><h5
        className="sm:text-2xl font-normal text-body">Oopps. The page you were looking for doesn't exist..</h5><p
        className="mb-[50px]">You may have mistyped the address or the page may have moved.</p><p
        className="mb-[50px]"><a rel="preload"
                                 className="inline-flex items-center justify-center font-normal text-center whitespace-normal border border-solid leading-body transition-colors min-w-max active:text-white bg-transparent border-primary text-primary hover:bg-primary hover:text-white focus:shadow-primary/50 focus:shadow-xs text-base px-3 py-[0.594rem] px-[25px] uppercase border-2 tracking-wider"
                                 href="/">Back to Home</a></p><p className="mb-0 text-xs text-gray-600">© Copyright
        2023. All Rights Reserved. TripZin.</p></div>
    </div>
  )
}
