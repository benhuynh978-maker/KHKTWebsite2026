/* Thẻ bao dùng chung cho các khối trên Dashboard và các trang khác. */

export default function Khoi({ tieuDe, phu, hanhDong, children }) {
  return (
    <section className="khoi">
      {(tieuDe || hanhDong) && (
        <header className="khoi__dau">
          <div>
            {tieuDe && <h2 className="khoi__tieu-de">{tieuDe}</h2>}
            {phu && <p className="khoi__phu">{phu}</p>}
          </div>
          {hanhDong}
        </header>
      )}
      <div className="khoi__than">{children}</div>
    </section>
  )
}
