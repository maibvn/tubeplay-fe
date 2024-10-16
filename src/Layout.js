const Layout = (props) => {
  return (
    <>
      <div className="container-fluid text-center bg-dark">
        <div className="row justify-content-center ">{props.children}</div>
      </div>
    </>
  );
};
export default Layout;
