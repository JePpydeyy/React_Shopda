<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/fav-icon.png" />
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/babel-standalone@7.22.10/babel.min.js"></script>
    <title>Tinh Lâm - Trang Sức Phong Thủy</title>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        function formatPrice(price) {
            return new Intl.NumberFormat('vi-VN').format(price);
        }

        const Shop = () => {
            const [minPrice, setMinPrice] = React.useState(0);
            const [maxPrice, setMaxPrice] = React.useState(6000000);
            const [cartVisible, setCartVisible] = React.useState(false);

            const updatePriceDisplay = (min, max, activeInput) => {
                let finalMin = min;
                let finalMax = max;
                if (min >= max) {
                    if (activeInput === 'min') {
                        finalMax = min + 100000;
                    } else {
                        finalMin = max - 100000;
                    }
                }
                setMinPrice(finalMin);
                setMaxPrice(finalMax);
            };

            const minPercent = (minPrice / 6000000) * 100;
            const maxPercent = (maxPrice / 6000000) * 100;

            const closeCartPopup = () => setCartVisible(false);

            const products = [
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/GARNET-LUU-DO-CHARM-PHUC.png", alt: "VÒNG GARNET LỰU ĐỎ", title: "VÒNG GARNET LỰU ĐỎ", price: 4010000 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/CAM-THACH-XANH-CHARM-LOC.png", alt: "VÒNG CẨM THẠCH XANH", title: "VÒNG CẨM THẠCH XANH", price: 2340000 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/APATITE-CHARM-THO.png", alt: "VÒNG APATITE BIỂN XANH", title: "VÒNG APATITE BIỂN XANH", price: 2740000 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MOONSTONE-VUONG-MAY-BAC-WEB-TIKTOK.png", alt: "VÒNG MOONSTONE", title: "VÒNG MOONSTONE", price: 2240000 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MH-VANG-VUONG-MAY-BAC-WEB-TIKTOK.png", alt: "VÒNG MẮT HỔ VÀNG NÂU", title: "VÒNG MẮT HỔ VÀNG NÂU - PHỐI ƯU LINH", price: 1254000 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MH-DO-VUONG-MAY-DIOPSIDE-WEB-TIKTOK.png", alt: "VÒNG MẮT HỔ ĐỎ", title: "VÒNG MẮT HỔ ĐỎ - PHỐI DIOPSIDE", price: 1540000 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/HEMATITE-PHOI-MOONSTONE-VUONG-MAY-BAC-WEB-TIKTOK.png", alt: "VÒNG MOONSTONE PHỐI HEMATITE", title: "VÒNG MOONSTONE PHỐI HEMATITE", price: 1682000 },
            ];

            const cartItems = [
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/APATITE-CHARM-THO.png", title: "VÒNG APATITE BIỂN XANH", charm: "Charm Kim Thọ", stoneSize: "10 Li (Phù Hợp Size Tay: 15cm-18cm)", wristSize: "12 cm", price: 2740000, quantity: 6 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MH-DO-VUONG-MAY-DIOPSIDE-WEB-TIKTOK.png", title: "VÒNG MẮT HỔ ĐỎ - PHỐI DIOPSIDE", charm: "Charm Diopside", stoneSize: "10 Li (Phù Hợp Size Tay: 15cm-18cm)", wristSize: "13 cm", price: 1540000, quantity: 2 },
                { image: "https://public.youware.com/users-website-assets/prod/9ad90c6e-7bcc-4cf9-98b3-9b23c289f60f/MAT-DIEU-HAU-VUONG-MAY-BAC-WEB-TIKTOK.png", title: "VÒNG MẮT DIỀU HÂU", charm: "Charm Bạc", stoneSize: "10 Li (Phù Hợp Size Tay: 15cm-18cm)", wristSize: "14 cm", price: 1800000, quantity: 1 },
            ];

            return (
                <section className="shop py-8">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 md:col-span-3">
                                <div className="bg-white p-4 shadow">
                                    <form className="flex items-center mb-6">
                                        <input type="text" placeholder="Tìm kiếm..." className="w-full p-2 border rounded-l" />
                                        <button type="submit" className="p-2 bg-gray-200 rounded-r">
                                            <i className="fa fa-search"></i>
                                        </button>
                                    </form>
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold mb-2">GIÁ SẢN PHẨM <span className="float-right">–</span></h6>
                                        <div className="relative h-2 bg-gray-200 rounded">
                                            <div className="absolute h-2 bg-blue-500" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}></div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="6000000"
                                            step="100000"
                                            value={minPrice}
                                            onChange={(e) => updatePriceDisplay(parseInt(e.target.value), maxPrice, 'min')}
                                            className="w-full mt-2"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="6000000"
                                            step="100000"
                                            value={maxPrice}
                                            onChange={(e) => updatePriceDisplay(minPrice, parseInt(e.target.value), 'max')}
                                            className="w-full mt-2"
                                        />
                                        <div className="text-sm mt-2">
                                            Giá: <span>{formatPrice(minPrice)}</span> VND — <span>{formatPrice(maxPrice)}</span> VND
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold mb-2">LOẠI SẢN PHẨM</h6>
                                        <div>
                                            <label className="block"><input type="radio" name="productType" className="mr-2" /> Phong thủy</label>
                                            <label className="block"><input type="radio" name="productType" className="mr-2" /> Thời trang</label>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold mb-2">DÒNG SẢN PHẨM</h6>
                                        <div>
                                            <label className="block"><input type="radio" name="productLine" className="mr-2" /> Cao cấp</label>
                                            <label className="block"><input type="radio" name="productLine" className="mr-2" /> Trung cấp</label>
                                            <label className="block"><input type="radio" name="productLine" className="mr-2" /> Phổ thông</label>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold mb-2">BỘ SƯU TẬP</h6>
                                        <div>
                                            {[
                                                "BST Charm Phúc - Lộc - Thọ",
                                                "BST Charm Vân Mây",
                                                "BST Charm Nơ",
                                                "BST Charm Kim Long Phát Lộc",
                                                "BST Charm Cá Chép Hóa Rồng",
                                                "BST Charm Tỳ Hưu",
                                                "Pride Month",
                                                "BST Charm Lồng Đèn",
                                                "BST Charm Bọc Vàng",
                                                "BST Charm Yêu Trẻ",
                                                "BST Vòng Cổ Đá Phong Thủy",
                                                "BST Vòng Hổ Phách",
                                                "BST Charm Ống Hồ",
                                                "BST Charm Sen Việt"
                                            ].map((collection) => (
                                                <label className="block" key={collection}>
                                                    <input type="checkbox" name="collection" className="mr-2" /> {collection}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-9">
                                <div className="flex justify-between items-center mb-6">
                                    <p>Hiển thị 1–12 trong 271 kết quả</p>
                                    <select className="p-2 border rounded">
                                        <option value="">Sắp xếp theo sự phổ biến</option>
                                        <option value="">Sắp xếp theo mới nhất</option>
                                        <option value="">Sắp xếp theo giá: thấp đến cao</option>
                                        <option value="">Sắp xếp theo giá: cao đến thấp</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product, index) => (
                                        <div key={index} className="relative group">
                                            <div className="relative">
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">NEW</span>
                                                <a href="#" className="block">
                                                    <img src={product.image} alt={product.alt} className="w-full h-auto" />
                                                </a>
                                            </div>
                                            <div className="p-4">
                                                <h6 className="text-sm font-semibold">{product.title}</h6>
                                                <h5 className="text-lg font-bold">{formatPrice(product.price)} VND</h5>
                                                <div className="mt-2 hidden group-hover:block">
                                                    <a href="#" className="text-blue-500 hover:underline">Xem chi tiết</a>
                                                    <div className="flex mt-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className="fa-regular fa-star text-gray-400"></i>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center space-x-2 mt-6">
                                    <a href="#" className="px-3 py-1 bg-blue-500 text-white rounded">1</a>
                                    <a href="#" className="px-3 py-1 border rounded">2</a>
                                    <a href="#" className="px-3 py-1 border rounded">3</a>
                                    <a href="#" className="px-3 py-1 border rounded">4</a>
                                    <span>...</span>
                                    <a href="#" className="px-3 py-1 border rounded">21</a>
                                    <a href="#" className="px-3 py-1 border rounded">22</a>
                                    <a href="#" className="px-3 py-1 border rounded">23</a>
                                    <a href="#" className="px-3 py-1 border rounded">→</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="cartPopupOverlay" className={`fixed inset-0 bg-black bg-opacity-20 z-50 ${cartVisible ? 'block' : 'hidden'}`} onClick={closeCartPopup}></div>
                    <div id="cartPopup" className={`fixed top-0 right-0 w-full md:w-1/3 bg-white shadow-lg z-50 transform ${cartVisible ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300`}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <span className="text-lg font-semibold">GIỎ HÀNG CỦA BẠN</span>
                            <button className="text-2xl" onClick={closeCartPopup}>×</button>
                        </div>
                        <div className="p-4">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex items-center mb-4">
                                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover mr-4" />
                                    <div className="flex-1">
                                        <div className="font-semibold">{item.title}</div>
                                        <div className="text-sm">
                                            <b>Charm:</b> {item.charm}<br />
                                            <b>Size Viên Đá:</b> {item.stoneSize}<br />
                                            <b>Size Tay:</b> {item.wristSize}
                                        </div>
                                        <div className="text-sm">Price: {formatPrice(item.price)} VND</div>
                                        <div className="flex items-center mt-2">
                                            <button className="px-2 py-1 border">-</button>
                                            <input type="text" value={item.quantity} readOnly className="w-12 text-center border mx-2" />
                                            <button className="px-2 py-1 border">+</button>
                                            <span className="ml-4">{formatPrice(item.price * item.quantity)} VND</span>
                                        </div>
                                    </div>
                                    <button className="ml-4"><i className="fa fa-trash"></i></button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t">
                            <div className="flex justify-between mb-4">
                                <div><b>Tổng Cộng:</b> {formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))} VND</div>
                                <div>Total: {formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))} VND</div>
                            </div>
                            <div className="flex space-x-2 mb-4">
                                <a href="./cart.html" className="flex-1 text-center p-2 border rounded">Xem Giỏ Hàng</a>
                                <button className="flex-1 p-2 bg-blue-500 text-white rounded">Thanh Toán</button>
                            </div>
                            <button className="w-full p-2 border rounded" onClick={closeCartPopup}>Tiếp Tục Mua Sắm</button>
                        </div>
                    </div>
                </section>
            );
        };

        ReactDOM.render(<Shop />, document.getElementById('root'));
    </script>
</body>
</html>