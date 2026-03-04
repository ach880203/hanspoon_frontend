-- Hanspoon seed with product + product_image
-- total products: 150
-- image policy: per product MAIN(rep 1 + non-rep 1), DETAIL(2)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- [1/150] 국산 양파 2kg 신선팩 1호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 양파 2kg 신선팩 1호', 7200, 80, '<h3>국산 양파 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 양파 신선팩.jpg', 'ingredient-2kg-1-1-main-1.jpg', '/images/product-seed/ingredient-2kg-1-1/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2kg-1-1-main-2.jpg', '/images/product-seed/ingredient-2kg-1-1/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2kg-1-1-detail-1.jpg', '/images/product-seed/ingredient-2kg-1-1/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2kg-1-1-detail-2.jpg', '/images/product-seed/ingredient-2kg-1-1/detail-2.jpg', 0, 'DETAIL');

-- [2/150] 친환경 애호박 2입 신선팩 2호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '친환경 애호박 2입 신선팩 2호', 4800, 97, '<h3>친환경 애호박 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2입</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '친환경 애호박 신선팩.jpg', 'ingredient-2-2-2-main-1.jpg', '/images/product-seed/ingredient-2-2-2/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2-2-2-main-2.jpg', '/images/product-seed/ingredient-2-2-2/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2-2-2-detail-1.jpg', '/images/product-seed/ingredient-2-2-2/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2-2-2-detail-2.jpg', '/images/product-seed/ingredient-2-2-2/detail-2.jpg', 0, 'DETAIL');

-- [3/150] 손질 새우살 300g 신선팩 3호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '손질 새우살 300g 신선팩 3호', 16800, 114, '<h3>손질 새우살 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 300g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '손질 새우살 신선팩.jpg', 'ingredient-300g-3-3-main-1.jpg', '/images/product-seed/ingredient-300g-3-3/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-300g-3-3-main-2.jpg', '/images/product-seed/ingredient-300g-3-3/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-300g-3-3-detail-1.jpg', '/images/product-seed/ingredient-300g-3-3/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-300g-3-3-detail-2.jpg', '/images/product-seed/ingredient-300g-3-3/detail-2.jpg', 0, 'DETAIL');

-- [4/150] 대파 1단 신선팩 4호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '대파 1단 신선팩 4호', 4100, 131, '<h3>대파 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1단</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '대파 신선팩.jpg', 'ingredient-1-4-4-main-1.jpg', '/images/product-seed/ingredient-1-4-4/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1-4-4-main-2.jpg', '/images/product-seed/ingredient-1-4-4/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1-4-4-detail-1.jpg', '/images/product-seed/ingredient-1-4-4/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1-4-4-detail-2.jpg', '/images/product-seed/ingredient-1-4-4/detail-2.jpg', 0, 'DETAIL');

-- [5/150] 감자 3kg 신선팩 5호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '감자 3kg 신선팩 5호', 8900, 148, '<h3>감자 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 3kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감자 신선팩.jpg', 'ingredient-3kg-5-5-main-1.jpg', '/images/product-seed/ingredient-3kg-5-5/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-3kg-5-5-main-2.jpg', '/images/product-seed/ingredient-3kg-5-5/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-3kg-5-5-detail-1.jpg', '/images/product-seed/ingredient-3kg-5-5/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-3kg-5-5-detail-2.jpg', '/images/product-seed/ingredient-3kg-5-5/detail-2.jpg', 0, 'DETAIL');

-- [6/150] 다진 마늘 500g 신선팩 6호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '다진 마늘 500g 신선팩 6호', 6800, 165, '<h3>다진 마늘 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 500g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '다진 마늘 신선팩.jpg', 'ingredient-500g-6-6-main-1.jpg', '/images/product-seed/ingredient-500g-6-6/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-500g-6-6-main-2.jpg', '/images/product-seed/ingredient-500g-6-6/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-500g-6-6-detail-1.jpg', '/images/product-seed/ingredient-500g-6-6/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-500g-6-6-detail-2.jpg', '/images/product-seed/ingredient-500g-6-6/detail-2.jpg', 0, 'DETAIL');

-- [7/150] 표고버섯 400g 신선팩 7호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '표고버섯 400g 신선팩 7호', 8500, 182, '<h3>표고버섯 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '표고버섯 신선팩.jpg', 'ingredient-400g-7-7-main-1.jpg', '/images/product-seed/ingredient-400g-7-7/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-7-7-main-2.jpg', '/images/product-seed/ingredient-400g-7-7/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-7-7-detail-1.jpg', '/images/product-seed/ingredient-400g-7-7/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-7-7-detail-2.jpg', '/images/product-seed/ingredient-400g-7-7/detail-2.jpg', 0, 'DETAIL');

-- [8/150] 한우 불고기용 400g 신선팩 8호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '한우 불고기용 400g 신선팩 8호', 23800, 199, '<h3>한우 불고기용 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '한우 불고기용 신선팩.jpg', 'ingredient-400g-8-8-main-1.jpg', '/images/product-seed/ingredient-400g-8-8/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-8-8-main-2.jpg', '/images/product-seed/ingredient-400g-8-8/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-8-8-detail-1.jpg', '/images/product-seed/ingredient-400g-8-8/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-8-8-detail-2.jpg', '/images/product-seed/ingredient-400g-8-8/detail-2.jpg', 0, 'DETAIL');

-- [9/150] 제주 당근 1kg 신선팩 9호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '제주 당근 1kg 신선팩 9호', 6400, 96, '<h3>제주 당근 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제주 당근 신선팩.jpg', 'ingredient-1kg-9-9-main-1.jpg', '/images/product-seed/ingredient-1kg-9-9/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1kg-9-9-main-2.jpg', '/images/product-seed/ingredient-1kg-9-9/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1kg-9-9-detail-1.jpg', '/images/product-seed/ingredient-1kg-9-9/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1kg-9-9-detail-2.jpg', '/images/product-seed/ingredient-1kg-9-9/detail-2.jpg', 0, 'DETAIL');

-- [10/150] 국산 두부 350g 신선팩 10호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 두부 350g 신선팩 10호', 2800, 113, '<h3>국산 두부 신선팩</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 350g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 두부 신선팩.jpg', 'ingredient-350g-10-10-main-1.jpg', '/images/product-seed/ingredient-350g-10-10/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-350g-10-10-main-2.jpg', '/images/product-seed/ingredient-350g-10-10/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-350g-10-10-detail-1.jpg', '/images/product-seed/ingredient-350g-10-10/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-350g-10-10-detail-2.jpg', '/images/product-seed/ingredient-350g-10-10/detail-2.jpg', 0, 'DETAIL');

-- [11/150] 국산 양파 2kg 가정용 11호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 양파 2kg 가정용 11호', 7200, 130, '<h3>국산 양파 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 양파 가정용.jpg', 'ingredient-2kg-11-11-main-1.jpg', '/images/product-seed/ingredient-2kg-11-11/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2kg-11-11-main-2.jpg', '/images/product-seed/ingredient-2kg-11-11/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2kg-11-11-detail-1.jpg', '/images/product-seed/ingredient-2kg-11-11/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2kg-11-11-detail-2.jpg', '/images/product-seed/ingredient-2kg-11-11/detail-2.jpg', 0, 'DETAIL');

-- [12/150] 친환경 애호박 2입 가정용 12호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '친환경 애호박 2입 가정용 12호', 4800, 147, '<h3>친환경 애호박 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2입</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '친환경 애호박 가정용.jpg', 'ingredient-2-12-12-main-1.jpg', '/images/product-seed/ingredient-2-12-12/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2-12-12-main-2.jpg', '/images/product-seed/ingredient-2-12-12/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2-12-12-detail-1.jpg', '/images/product-seed/ingredient-2-12-12/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2-12-12-detail-2.jpg', '/images/product-seed/ingredient-2-12-12/detail-2.jpg', 0, 'DETAIL');

-- [13/150] 손질 새우살 300g 가정용 13호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '손질 새우살 300g 가정용 13호', 16800, 164, '<h3>손질 새우살 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 300g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '손질 새우살 가정용.jpg', 'ingredient-300g-13-13-main-1.jpg', '/images/product-seed/ingredient-300g-13-13/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-300g-13-13-main-2.jpg', '/images/product-seed/ingredient-300g-13-13/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-300g-13-13-detail-1.jpg', '/images/product-seed/ingredient-300g-13-13/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-300g-13-13-detail-2.jpg', '/images/product-seed/ingredient-300g-13-13/detail-2.jpg', 0, 'DETAIL');

-- [14/150] 대파 1단 가정용 14호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '대파 1단 가정용 14호', 4100, 181, '<h3>대파 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1단</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '대파 가정용.jpg', 'ingredient-1-14-14-main-1.jpg', '/images/product-seed/ingredient-1-14-14/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1-14-14-main-2.jpg', '/images/product-seed/ingredient-1-14-14/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1-14-14-detail-1.jpg', '/images/product-seed/ingredient-1-14-14/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1-14-14-detail-2.jpg', '/images/product-seed/ingredient-1-14-14/detail-2.jpg', 0, 'DETAIL');

-- [15/150] 감자 3kg 가정용 15호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '감자 3kg 가정용 15호', 8900, 198, '<h3>감자 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 3kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감자 가정용.jpg', 'ingredient-3kg-15-15-main-1.jpg', '/images/product-seed/ingredient-3kg-15-15/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-3kg-15-15-main-2.jpg', '/images/product-seed/ingredient-3kg-15-15/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-3kg-15-15-detail-1.jpg', '/images/product-seed/ingredient-3kg-15-15/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-3kg-15-15-detail-2.jpg', '/images/product-seed/ingredient-3kg-15-15/detail-2.jpg', 0, 'DETAIL');

-- [16/150] 다진 마늘 500g 가정용 16호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '다진 마늘 500g 가정용 16호', 6800, 95, '<h3>다진 마늘 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 500g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '다진 마늘 가정용.jpg', 'ingredient-500g-16-16-main-1.jpg', '/images/product-seed/ingredient-500g-16-16/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-500g-16-16-main-2.jpg', '/images/product-seed/ingredient-500g-16-16/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-500g-16-16-detail-1.jpg', '/images/product-seed/ingredient-500g-16-16/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-500g-16-16-detail-2.jpg', '/images/product-seed/ingredient-500g-16-16/detail-2.jpg', 0, 'DETAIL');

-- [17/150] 표고버섯 400g 가정용 17호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '표고버섯 400g 가정용 17호', 8500, 112, '<h3>표고버섯 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '표고버섯 가정용.jpg', 'ingredient-400g-17-17-main-1.jpg', '/images/product-seed/ingredient-400g-17-17/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-17-17-main-2.jpg', '/images/product-seed/ingredient-400g-17-17/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-17-17-detail-1.jpg', '/images/product-seed/ingredient-400g-17-17/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-17-17-detail-2.jpg', '/images/product-seed/ingredient-400g-17-17/detail-2.jpg', 0, 'DETAIL');

-- [18/150] 한우 불고기용 400g 가정용 18호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '한우 불고기용 400g 가정용 18호', 23800, 129, '<h3>한우 불고기용 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '한우 불고기용 가정용.jpg', 'ingredient-400g-18-18-main-1.jpg', '/images/product-seed/ingredient-400g-18-18/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-18-18-main-2.jpg', '/images/product-seed/ingredient-400g-18-18/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-18-18-detail-1.jpg', '/images/product-seed/ingredient-400g-18-18/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-18-18-detail-2.jpg', '/images/product-seed/ingredient-400g-18-18/detail-2.jpg', 0, 'DETAIL');

-- [19/150] 제주 당근 1kg 가정용 19호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '제주 당근 1kg 가정용 19호', 6400, 146, '<h3>제주 당근 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제주 당근 가정용.jpg', 'ingredient-1kg-19-19-main-1.jpg', '/images/product-seed/ingredient-1kg-19-19/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1kg-19-19-main-2.jpg', '/images/product-seed/ingredient-1kg-19-19/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1kg-19-19-detail-1.jpg', '/images/product-seed/ingredient-1kg-19-19/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1kg-19-19-detail-2.jpg', '/images/product-seed/ingredient-1kg-19-19/detail-2.jpg', 0, 'DETAIL');

-- [20/150] 국산 두부 350g 가정용 20호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 두부 350g 가정용 20호', 2800, 163, '<h3>국산 두부 가정용</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 350g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 두부 가정용.jpg', 'ingredient-350g-20-20-main-1.jpg', '/images/product-seed/ingredient-350g-20-20/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-350g-20-20-main-2.jpg', '/images/product-seed/ingredient-350g-20-20/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-350g-20-20-detail-1.jpg', '/images/product-seed/ingredient-350g-20-20/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-350g-20-20-detail-2.jpg', '/images/product-seed/ingredient-350g-20-20/detail-2.jpg', 0, 'DETAIL');

-- [21/150] 국산 양파 2kg 프리미엄 21호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 양파 2kg 프리미엄 21호', 7200, 180, '<h3>국산 양파 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 양파 프리미엄.jpg', 'ingredient-2kg-21-21-main-1.jpg', '/images/product-seed/ingredient-2kg-21-21/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2kg-21-21-main-2.jpg', '/images/product-seed/ingredient-2kg-21-21/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2kg-21-21-detail-1.jpg', '/images/product-seed/ingredient-2kg-21-21/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2kg-21-21-detail-2.jpg', '/images/product-seed/ingredient-2kg-21-21/detail-2.jpg', 0, 'DETAIL');

-- [22/150] 친환경 애호박 2입 프리미엄 22호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '친환경 애호박 2입 프리미엄 22호', 4800, 197, '<h3>친환경 애호박 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2입</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '친환경 애호박 프리미엄.jpg', 'ingredient-2-22-22-main-1.jpg', '/images/product-seed/ingredient-2-22-22/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2-22-22-main-2.jpg', '/images/product-seed/ingredient-2-22-22/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2-22-22-detail-1.jpg', '/images/product-seed/ingredient-2-22-22/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2-22-22-detail-2.jpg', '/images/product-seed/ingredient-2-22-22/detail-2.jpg', 0, 'DETAIL');

-- [23/150] 손질 새우살 300g 프리미엄 23호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '손질 새우살 300g 프리미엄 23호', 16800, 94, '<h3>손질 새우살 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 300g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '손질 새우살 프리미엄.jpg', 'ingredient-300g-23-23-main-1.jpg', '/images/product-seed/ingredient-300g-23-23/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-300g-23-23-main-2.jpg', '/images/product-seed/ingredient-300g-23-23/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-300g-23-23-detail-1.jpg', '/images/product-seed/ingredient-300g-23-23/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-300g-23-23-detail-2.jpg', '/images/product-seed/ingredient-300g-23-23/detail-2.jpg', 0, 'DETAIL');

-- [24/150] 대파 1단 프리미엄 24호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '대파 1단 프리미엄 24호', 4100, 111, '<h3>대파 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1단</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '대파 프리미엄.jpg', 'ingredient-1-24-24-main-1.jpg', '/images/product-seed/ingredient-1-24-24/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1-24-24-main-2.jpg', '/images/product-seed/ingredient-1-24-24/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1-24-24-detail-1.jpg', '/images/product-seed/ingredient-1-24-24/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1-24-24-detail-2.jpg', '/images/product-seed/ingredient-1-24-24/detail-2.jpg', 0, 'DETAIL');

-- [25/150] 감자 3kg 프리미엄 25호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '감자 3kg 프리미엄 25호', 8900, 128, '<h3>감자 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 3kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감자 프리미엄.jpg', 'ingredient-3kg-25-25-main-1.jpg', '/images/product-seed/ingredient-3kg-25-25/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-3kg-25-25-main-2.jpg', '/images/product-seed/ingredient-3kg-25-25/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-3kg-25-25-detail-1.jpg', '/images/product-seed/ingredient-3kg-25-25/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-3kg-25-25-detail-2.jpg', '/images/product-seed/ingredient-3kg-25-25/detail-2.jpg', 0, 'DETAIL');

-- [26/150] 다진 마늘 500g 프리미엄 26호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '다진 마늘 500g 프리미엄 26호', 6800, 145, '<h3>다진 마늘 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 500g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '다진 마늘 프리미엄.jpg', 'ingredient-500g-26-26-main-1.jpg', '/images/product-seed/ingredient-500g-26-26/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-500g-26-26-main-2.jpg', '/images/product-seed/ingredient-500g-26-26/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-500g-26-26-detail-1.jpg', '/images/product-seed/ingredient-500g-26-26/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-500g-26-26-detail-2.jpg', '/images/product-seed/ingredient-500g-26-26/detail-2.jpg', 0, 'DETAIL');

-- [27/150] 표고버섯 400g 프리미엄 27호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '표고버섯 400g 프리미엄 27호', 8500, 162, '<h3>표고버섯 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '표고버섯 프리미엄.jpg', 'ingredient-400g-27-27-main-1.jpg', '/images/product-seed/ingredient-400g-27-27/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-27-27-main-2.jpg', '/images/product-seed/ingredient-400g-27-27/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-27-27-detail-1.jpg', '/images/product-seed/ingredient-400g-27-27/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-27-27-detail-2.jpg', '/images/product-seed/ingredient-400g-27-27/detail-2.jpg', 0, 'DETAIL');

-- [28/150] 한우 불고기용 400g 프리미엄 28호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '한우 불고기용 400g 프리미엄 28호', 23800, 179, '<h3>한우 불고기용 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '한우 불고기용 프리미엄.jpg', 'ingredient-400g-28-28-main-1.jpg', '/images/product-seed/ingredient-400g-28-28/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-28-28-main-2.jpg', '/images/product-seed/ingredient-400g-28-28/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-28-28-detail-1.jpg', '/images/product-seed/ingredient-400g-28-28/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-28-28-detail-2.jpg', '/images/product-seed/ingredient-400g-28-28/detail-2.jpg', 0, 'DETAIL');

-- [29/150] 제주 당근 1kg 프리미엄 29호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '제주 당근 1kg 프리미엄 29호', 6400, 196, '<h3>제주 당근 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제주 당근 프리미엄.jpg', 'ingredient-1kg-29-29-main-1.jpg', '/images/product-seed/ingredient-1kg-29-29/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1kg-29-29-main-2.jpg', '/images/product-seed/ingredient-1kg-29-29/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1kg-29-29-detail-1.jpg', '/images/product-seed/ingredient-1kg-29-29/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1kg-29-29-detail-2.jpg', '/images/product-seed/ingredient-1kg-29-29/detail-2.jpg', 0, 'DETAIL');

-- [30/150] 국산 두부 350g 프리미엄 30호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 두부 350g 프리미엄 30호', 2800, 93, '<h3>국산 두부 프리미엄</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 350g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 두부 프리미엄.jpg', 'ingredient-350g-30-30-main-1.jpg', '/images/product-seed/ingredient-350g-30-30/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-350g-30-30-main-2.jpg', '/images/product-seed/ingredient-350g-30-30/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-350g-30-30-detail-1.jpg', '/images/product-seed/ingredient-350g-30-30/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-350g-30-30-detail-2.jpg', '/images/product-seed/ingredient-350g-30-30/detail-2.jpg', 0, 'DETAIL');

-- [31/150] 국산 양파 2kg 실속형 31호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 양파 2kg 실속형 31호', 7200, 110, '<h3>국산 양파 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 양파 실속형.jpg', 'ingredient-2kg-31-31-main-1.jpg', '/images/product-seed/ingredient-2kg-31-31/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2kg-31-31-main-2.jpg', '/images/product-seed/ingredient-2kg-31-31/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2kg-31-31-detail-1.jpg', '/images/product-seed/ingredient-2kg-31-31/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2kg-31-31-detail-2.jpg', '/images/product-seed/ingredient-2kg-31-31/detail-2.jpg', 0, 'DETAIL');

-- [32/150] 친환경 애호박 2입 실속형 32호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '친환경 애호박 2입 실속형 32호', 4800, 127, '<h3>친환경 애호박 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2입</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '친환경 애호박 실속형.jpg', 'ingredient-2-32-32-main-1.jpg', '/images/product-seed/ingredient-2-32-32/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2-32-32-main-2.jpg', '/images/product-seed/ingredient-2-32-32/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2-32-32-detail-1.jpg', '/images/product-seed/ingredient-2-32-32/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2-32-32-detail-2.jpg', '/images/product-seed/ingredient-2-32-32/detail-2.jpg', 0, 'DETAIL');

-- [33/150] 손질 새우살 300g 실속형 33호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '손질 새우살 300g 실속형 33호', 16800, 144, '<h3>손질 새우살 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 300g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '손질 새우살 실속형.jpg', 'ingredient-300g-33-33-main-1.jpg', '/images/product-seed/ingredient-300g-33-33/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-300g-33-33-main-2.jpg', '/images/product-seed/ingredient-300g-33-33/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-300g-33-33-detail-1.jpg', '/images/product-seed/ingredient-300g-33-33/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-300g-33-33-detail-2.jpg', '/images/product-seed/ingredient-300g-33-33/detail-2.jpg', 0, 'DETAIL');

-- [34/150] 대파 1단 실속형 34호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '대파 1단 실속형 34호', 4100, 161, '<h3>대파 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1단</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '대파 실속형.jpg', 'ingredient-1-34-34-main-1.jpg', '/images/product-seed/ingredient-1-34-34/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1-34-34-main-2.jpg', '/images/product-seed/ingredient-1-34-34/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1-34-34-detail-1.jpg', '/images/product-seed/ingredient-1-34-34/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1-34-34-detail-2.jpg', '/images/product-seed/ingredient-1-34-34/detail-2.jpg', 0, 'DETAIL');

-- [35/150] 감자 3kg 실속형 35호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '감자 3kg 실속형 35호', 8900, 178, '<h3>감자 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 3kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감자 실속형.jpg', 'ingredient-3kg-35-35-main-1.jpg', '/images/product-seed/ingredient-3kg-35-35/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-3kg-35-35-main-2.jpg', '/images/product-seed/ingredient-3kg-35-35/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-3kg-35-35-detail-1.jpg', '/images/product-seed/ingredient-3kg-35-35/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-3kg-35-35-detail-2.jpg', '/images/product-seed/ingredient-3kg-35-35/detail-2.jpg', 0, 'DETAIL');

-- [36/150] 다진 마늘 500g 실속형 36호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '다진 마늘 500g 실속형 36호', 6800, 195, '<h3>다진 마늘 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 500g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '다진 마늘 실속형.jpg', 'ingredient-500g-36-36-main-1.jpg', '/images/product-seed/ingredient-500g-36-36/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-500g-36-36-main-2.jpg', '/images/product-seed/ingredient-500g-36-36/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-500g-36-36-detail-1.jpg', '/images/product-seed/ingredient-500g-36-36/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-500g-36-36-detail-2.jpg', '/images/product-seed/ingredient-500g-36-36/detail-2.jpg', 0, 'DETAIL');

-- [37/150] 표고버섯 400g 실속형 37호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '표고버섯 400g 실속형 37호', 8500, 92, '<h3>표고버섯 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '표고버섯 실속형.jpg', 'ingredient-400g-37-37-main-1.jpg', '/images/product-seed/ingredient-400g-37-37/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-37-37-main-2.jpg', '/images/product-seed/ingredient-400g-37-37/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-37-37-detail-1.jpg', '/images/product-seed/ingredient-400g-37-37/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-37-37-detail-2.jpg', '/images/product-seed/ingredient-400g-37-37/detail-2.jpg', 0, 'DETAIL');

-- [38/150] 한우 불고기용 400g 실속형 38호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '한우 불고기용 400g 실속형 38호', 23800, 109, '<h3>한우 불고기용 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '한우 불고기용 실속형.jpg', 'ingredient-400g-38-38-main-1.jpg', '/images/product-seed/ingredient-400g-38-38/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-38-38-main-2.jpg', '/images/product-seed/ingredient-400g-38-38/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-38-38-detail-1.jpg', '/images/product-seed/ingredient-400g-38-38/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-38-38-detail-2.jpg', '/images/product-seed/ingredient-400g-38-38/detail-2.jpg', 0, 'DETAIL');

-- [39/150] 제주 당근 1kg 실속형 39호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '제주 당근 1kg 실속형 39호', 6400, 126, '<h3>제주 당근 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제주 당근 실속형.jpg', 'ingredient-1kg-39-39-main-1.jpg', '/images/product-seed/ingredient-1kg-39-39/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1kg-39-39-main-2.jpg', '/images/product-seed/ingredient-1kg-39-39/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1kg-39-39-detail-1.jpg', '/images/product-seed/ingredient-1kg-39-39/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1kg-39-39-detail-2.jpg', '/images/product-seed/ingredient-1kg-39-39/detail-2.jpg', 0, 'DETAIL');

-- [40/150] 국산 두부 350g 실속형 40호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 두부 350g 실속형 40호', 2800, 143, '<h3>국산 두부 실속형</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 350g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 두부 실속형.jpg', 'ingredient-350g-40-40-main-1.jpg', '/images/product-seed/ingredient-350g-40-40/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-350g-40-40-main-2.jpg', '/images/product-seed/ingredient-350g-40-40/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-350g-40-40-detail-1.jpg', '/images/product-seed/ingredient-350g-40-40/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-350g-40-40-detail-2.jpg', '/images/product-seed/ingredient-350g-40-40/detail-2.jpg', 0, 'DETAIL');

-- [41/150] 국산 양파 2kg 셰프추천 41호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 양파 2kg 셰프추천 41호', 7200, 160, '<h3>국산 양파 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 양파 셰프추천.jpg', 'ingredient-2kg-41-41-main-1.jpg', '/images/product-seed/ingredient-2kg-41-41/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2kg-41-41-main-2.jpg', '/images/product-seed/ingredient-2kg-41-41/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2kg-41-41-detail-1.jpg', '/images/product-seed/ingredient-2kg-41-41/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2kg-41-41-detail-2.jpg', '/images/product-seed/ingredient-2kg-41-41/detail-2.jpg', 0, 'DETAIL');

-- [42/150] 친환경 애호박 2입 셰프추천 42호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '친환경 애호박 2입 셰프추천 42호', 4800, 177, '<h3>친환경 애호박 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 2입</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '친환경 애호박 셰프추천.jpg', 'ingredient-2-42-42-main-1.jpg', '/images/product-seed/ingredient-2-42-42/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-2-42-42-main-2.jpg', '/images/product-seed/ingredient-2-42-42/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-2-42-42-detail-1.jpg', '/images/product-seed/ingredient-2-42-42/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-2-42-42-detail-2.jpg', '/images/product-seed/ingredient-2-42-42/detail-2.jpg', 0, 'DETAIL');

-- [43/150] 손질 새우살 300g 셰프추천 43호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '손질 새우살 300g 셰프추천 43호', 16800, 194, '<h3>손질 새우살 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 300g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '손질 새우살 셰프추천.jpg', 'ingredient-300g-43-43-main-1.jpg', '/images/product-seed/ingredient-300g-43-43/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-300g-43-43-main-2.jpg', '/images/product-seed/ingredient-300g-43-43/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-300g-43-43-detail-1.jpg', '/images/product-seed/ingredient-300g-43-43/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-300g-43-43-detail-2.jpg', '/images/product-seed/ingredient-300g-43-43/detail-2.jpg', 0, 'DETAIL');

-- [44/150] 대파 1단 셰프추천 44호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '대파 1단 셰프추천 44호', 4100, 91, '<h3>대파 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1단</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '대파 셰프추천.jpg', 'ingredient-1-44-44-main-1.jpg', '/images/product-seed/ingredient-1-44-44/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1-44-44-main-2.jpg', '/images/product-seed/ingredient-1-44-44/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1-44-44-detail-1.jpg', '/images/product-seed/ingredient-1-44-44/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1-44-44-detail-2.jpg', '/images/product-seed/ingredient-1-44-44/detail-2.jpg', 0, 'DETAIL');

-- [45/150] 감자 3kg 셰프추천 45호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '감자 3kg 셰프추천 45호', 8900, 108, '<h3>감자 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 3kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감자 셰프추천.jpg', 'ingredient-3kg-45-45-main-1.jpg', '/images/product-seed/ingredient-3kg-45-45/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-3kg-45-45-main-2.jpg', '/images/product-seed/ingredient-3kg-45-45/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-3kg-45-45-detail-1.jpg', '/images/product-seed/ingredient-3kg-45-45/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-3kg-45-45-detail-2.jpg', '/images/product-seed/ingredient-3kg-45-45/detail-2.jpg', 0, 'DETAIL');

-- [46/150] 다진 마늘 500g 셰프추천 46호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '다진 마늘 500g 셰프추천 46호', 6800, 125, '<h3>다진 마늘 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 500g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '다진 마늘 셰프추천.jpg', 'ingredient-500g-46-46-main-1.jpg', '/images/product-seed/ingredient-500g-46-46/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-500g-46-46-main-2.jpg', '/images/product-seed/ingredient-500g-46-46/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-500g-46-46-detail-1.jpg', '/images/product-seed/ingredient-500g-46-46/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-500g-46-46-detail-2.jpg', '/images/product-seed/ingredient-500g-46-46/detail-2.jpg', 0, 'DETAIL');

-- [47/150] 표고버섯 400g 셰프추천 47호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '표고버섯 400g 셰프추천 47호', 8500, 142, '<h3>표고버섯 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '표고버섯 셰프추천.jpg', 'ingredient-400g-47-47-main-1.jpg', '/images/product-seed/ingredient-400g-47-47/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-47-47-main-2.jpg', '/images/product-seed/ingredient-400g-47-47/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-47-47-detail-1.jpg', '/images/product-seed/ingredient-400g-47-47/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-47-47-detail-2.jpg', '/images/product-seed/ingredient-400g-47-47/detail-2.jpg', 0, 'DETAIL');

-- [48/150] 한우 불고기용 400g 셰프추천 48호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '한우 불고기용 400g 셰프추천 48호', 23800, 159, '<h3>한우 불고기용 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 400g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '한우 불고기용 셰프추천.jpg', 'ingredient-400g-48-48-main-1.jpg', '/images/product-seed/ingredient-400g-48-48/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-400g-48-48-main-2.jpg', '/images/product-seed/ingredient-400g-48-48/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-400g-48-48-detail-1.jpg', '/images/product-seed/ingredient-400g-48-48/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-400g-48-48-detail-2.jpg', '/images/product-seed/ingredient-400g-48-48/detail-2.jpg', 0, 'DETAIL');

-- [49/150] 제주 당근 1kg 셰프추천 49호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '제주 당근 1kg 셰프추천 49호', 6400, 176, '<h3>제주 당근 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 1kg</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제주 당근 셰프추천.jpg', 'ingredient-1kg-49-49-main-1.jpg', '/images/product-seed/ingredient-1kg-49-49/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-1kg-49-49-main-2.jpg', '/images/product-seed/ingredient-1kg-49-49/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-1kg-49-49-detail-1.jpg', '/images/product-seed/ingredient-1kg-49-49/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-1kg-49-49-detail-2.jpg', '/images/product-seed/ingredient-1kg-49-49/detail-2.jpg', 0, 'DETAIL');

-- [50/150] 국산 두부 350g 셰프추천 50호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('INGREDIENT', '국산 두부 350g 셰프추천 50호', 2800, 193, '<h3>국산 두부 셰프추천</h3><p>매일 사용하는 식재료를 선별 포장한 상품입니다. 조리 전 간단 세척 후 바로 사용 가능합니다.</p><ul><li>중량: 350g</li><li>보관: 냉장/냉동 권장</li><li>품질등급: Hanspoon QC 통과</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '국산 두부 셰프추천.jpg', 'ingredient-350g-50-50-main-1.jpg', '/images/product-seed/ingredient-350g-50-50/main-1.jpg', 1, 'MAIN'),
(@pid, '신선 포장.jpg', 'ingredient-350g-50-50-main-2.jpg', '/images/product-seed/ingredient-350g-50-50/main-2.jpg', 0, 'MAIN'),
(@pid, '활용 요리.jpg', 'ingredient-350g-50-50-detail-1.jpg', '/images/product-seed/ingredient-350g-50-50/detail-1.jpg', 0, 'DETAIL'),
(@pid, '원재료 안내.jpg', 'ingredient-350g-50-50-detail-2.jpg', '/images/product-seed/ingredient-350g-50-50/detail-2.jpg', 0, 'DETAIL');

-- [51/150] 소고기 미역국 키트 이지쿡 1호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '소고기 미역국 키트 이지쿡 1호', 13400, 50, '<h3>소고기 미역국 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '소고기 미역국 키트.jpg', 'meal-kit-1-51-main-1.jpg', '/images/product-seed/meal-kit-1-51/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-1-51-main-2.jpg', '/images/product-seed/meal-kit-1-51/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-1-51-detail-1.jpg', '/images/product-seed/meal-kit-1-51/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-1-51-detail-2.jpg', '/images/product-seed/meal-kit-1-51/detail-2.jpg', 0, 'DETAIL');

-- [52/150] 차돌 된장찌개 키트 이지쿡 2호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '차돌 된장찌개 키트 이지쿡 2호', 15900, 67, '<h3>차돌 된장찌개 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '차돌 된장찌개 키트.jpg', 'meal-kit-2-52-main-1.jpg', '/images/product-seed/meal-kit-2-52/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-2-52-main-2.jpg', '/images/product-seed/meal-kit-2-52/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-2-52-detail-1.jpg', '/images/product-seed/meal-kit-2-52/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-2-52-detail-2.jpg', '/images/product-seed/meal-kit-2-52/detail-2.jpg', 0, 'DETAIL');

-- [53/150] 새우 알리오올리오 키트 이지쿡 3호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '새우 알리오올리오 키트 이지쿡 3호', 18000, 84, '<h3>새우 알리오올리오 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '새우 알리오올리오 키트.jpg', 'meal-kit-3-53-main-1.jpg', '/images/product-seed/meal-kit-3-53/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-3-53-main-2.jpg', '/images/product-seed/meal-kit-3-53/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-3-53-detail-1.jpg', '/images/product-seed/meal-kit-3-53/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-3-53-detail-2.jpg', '/images/product-seed/meal-kit-3-53/detail-2.jpg', 0, 'DETAIL');

-- [54/150] 부대찌개 키트 이지쿡 4호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '부대찌개 키트 이지쿡 4호', 15900, 101, '<h3>부대찌개 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '부대찌개 키트.jpg', 'meal-kit-4-54-main-1.jpg', '/images/product-seed/meal-kit-4-54/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-4-54-main-2.jpg', '/images/product-seed/meal-kit-4-54/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-4-54-detail-1.jpg', '/images/product-seed/meal-kit-4-54/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-4-54-detail-2.jpg', '/images/product-seed/meal-kit-4-54/detail-2.jpg', 0, 'DETAIL');

-- [55/150] 제육볶음 키트 이지쿡 5호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '제육볶음 키트 이지쿡 5호', 14400, 118, '<h3>제육볶음 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제육볶음 키트.jpg', 'meal-kit-5-55-main-1.jpg', '/images/product-seed/meal-kit-5-55/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-5-55-main-2.jpg', '/images/product-seed/meal-kit-5-55/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-5-55-detail-1.jpg', '/images/product-seed/meal-kit-5-55/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-5-55-detail-2.jpg', '/images/product-seed/meal-kit-5-55/detail-2.jpg', 0, 'DETAIL');

-- [56/150] 감바스 키트 이지쿡 6호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '감바스 키트 이지쿡 6호', 17900, 135, '<h3>감바스 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감바스 키트.jpg', 'meal-kit-6-56-main-1.jpg', '/images/product-seed/meal-kit-6-56/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-6-56-main-2.jpg', '/images/product-seed/meal-kit-6-56/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-6-56-detail-1.jpg', '/images/product-seed/meal-kit-6-56/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-6-56-detail-2.jpg', '/images/product-seed/meal-kit-6-56/detail-2.jpg', 0, 'DETAIL');

-- [57/150] 닭갈비 키트 이지쿡 7호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '닭갈비 키트 이지쿡 7호', 19400, 62, '<h3>닭갈비 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '닭갈비 키트.jpg', 'meal-kit-7-57-main-1.jpg', '/images/product-seed/meal-kit-7-57/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-7-57-main-2.jpg', '/images/product-seed/meal-kit-7-57/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-7-57-detail-1.jpg', '/images/product-seed/meal-kit-7-57/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-7-57-detail-2.jpg', '/images/product-seed/meal-kit-7-57/detail-2.jpg', 0, 'DETAIL');

-- [58/150] 해물순두부 키트 이지쿡 8호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '해물순두부 키트 이지쿡 8호', 14900, 79, '<h3>해물순두부 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '해물순두부 키트.jpg', 'meal-kit-8-58-main-1.jpg', '/images/product-seed/meal-kit-8-58/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-8-58-main-2.jpg', '/images/product-seed/meal-kit-8-58/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-8-58-detail-1.jpg', '/images/product-seed/meal-kit-8-58/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-8-58-detail-2.jpg', '/images/product-seed/meal-kit-8-58/detail-2.jpg', 0, 'DETAIL');

-- [59/150] 묵은지 김치찌개 키트 이지쿡 9호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '묵은지 김치찌개 키트 이지쿡 9호', 15000, 96, '<h3>묵은지 김치찌개 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '묵은지 김치찌개 키트.jpg', 'meal-kit-9-59-main-1.jpg', '/images/product-seed/meal-kit-9-59/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-9-59-main-2.jpg', '/images/product-seed/meal-kit-9-59/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-9-59-detail-1.jpg', '/images/product-seed/meal-kit-9-59/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-9-59-detail-2.jpg', '/images/product-seed/meal-kit-9-59/detail-2.jpg', 0, 'DETAIL');

-- [60/150] 불고기 전골 키트 이지쿡 10호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '불고기 전골 키트 이지쿡 10호', 19900, 113, '<h3>불고기 전골 키트 이지쿡</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '불고기 전골 키트.jpg', 'meal-kit-10-60-main-1.jpg', '/images/product-seed/meal-kit-10-60/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-10-60-main-2.jpg', '/images/product-seed/meal-kit-10-60/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-10-60-detail-1.jpg', '/images/product-seed/meal-kit-10-60/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-10-60-detail-2.jpg', '/images/product-seed/meal-kit-10-60/detail-2.jpg', 0, 'DETAIL');

-- [61/150] 소고기 미역국 키트 홈파티 11호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '소고기 미역국 키트 홈파티 11호', 14400, 130, '<h3>소고기 미역국 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '소고기 미역국 키트.jpg', 'meal-kit-11-61-main-1.jpg', '/images/product-seed/meal-kit-11-61/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-11-61-main-2.jpg', '/images/product-seed/meal-kit-11-61/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-11-61-detail-1.jpg', '/images/product-seed/meal-kit-11-61/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-11-61-detail-2.jpg', '/images/product-seed/meal-kit-11-61/detail-2.jpg', 0, 'DETAIL');

-- [62/150] 차돌 된장찌개 키트 홈파티 12호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '차돌 된장찌개 키트 홈파티 12호', 14900, 57, '<h3>차돌 된장찌개 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '차돌 된장찌개 키트.jpg', 'meal-kit-12-62-main-1.jpg', '/images/product-seed/meal-kit-12-62/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-12-62-main-2.jpg', '/images/product-seed/meal-kit-12-62/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-12-62-detail-1.jpg', '/images/product-seed/meal-kit-12-62/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-12-62-detail-2.jpg', '/images/product-seed/meal-kit-12-62/detail-2.jpg', 0, 'DETAIL');

-- [63/150] 새우 알리오올리오 키트 홈파티 13호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '새우 알리오올리오 키트 홈파티 13호', 17000, 74, '<h3>새우 알리오올리오 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '새우 알리오올리오 키트.jpg', 'meal-kit-13-63-main-1.jpg', '/images/product-seed/meal-kit-13-63/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-13-63-main-2.jpg', '/images/product-seed/meal-kit-13-63/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-13-63-detail-1.jpg', '/images/product-seed/meal-kit-13-63/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-13-63-detail-2.jpg', '/images/product-seed/meal-kit-13-63/detail-2.jpg', 0, 'DETAIL');

-- [64/150] 부대찌개 키트 홈파티 14호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '부대찌개 키트 홈파티 14호', 16900, 91, '<h3>부대찌개 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '부대찌개 키트.jpg', 'meal-kit-14-64-main-1.jpg', '/images/product-seed/meal-kit-14-64/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-14-64-main-2.jpg', '/images/product-seed/meal-kit-14-64/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-14-64-detail-1.jpg', '/images/product-seed/meal-kit-14-64/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-14-64-detail-2.jpg', '/images/product-seed/meal-kit-14-64/detail-2.jpg', 0, 'DETAIL');

-- [65/150] 제육볶음 키트 홈파티 15호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '제육볶음 키트 홈파티 15호', 15400, 108, '<h3>제육볶음 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제육볶음 키트.jpg', 'meal-kit-15-65-main-1.jpg', '/images/product-seed/meal-kit-15-65/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-15-65-main-2.jpg', '/images/product-seed/meal-kit-15-65/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-15-65-detail-1.jpg', '/images/product-seed/meal-kit-15-65/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-15-65-detail-2.jpg', '/images/product-seed/meal-kit-15-65/detail-2.jpg', 0, 'DETAIL');

-- [66/150] 감바스 키트 홈파티 16호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '감바스 키트 홈파티 16호', 16900, 125, '<h3>감바스 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감바스 키트.jpg', 'meal-kit-16-66-main-1.jpg', '/images/product-seed/meal-kit-16-66/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-16-66-main-2.jpg', '/images/product-seed/meal-kit-16-66/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-16-66-detail-1.jpg', '/images/product-seed/meal-kit-16-66/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-16-66-detail-2.jpg', '/images/product-seed/meal-kit-16-66/detail-2.jpg', 0, 'DETAIL');

-- [67/150] 닭갈비 키트 홈파티 17호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '닭갈비 키트 홈파티 17호', 18400, 52, '<h3>닭갈비 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '닭갈비 키트.jpg', 'meal-kit-17-67-main-1.jpg', '/images/product-seed/meal-kit-17-67/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-17-67-main-2.jpg', '/images/product-seed/meal-kit-17-67/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-17-67-detail-1.jpg', '/images/product-seed/meal-kit-17-67/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-17-67-detail-2.jpg', '/images/product-seed/meal-kit-17-67/detail-2.jpg', 0, 'DETAIL');

-- [68/150] 해물순두부 키트 홈파티 18호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '해물순두부 키트 홈파티 18호', 15900, 69, '<h3>해물순두부 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '해물순두부 키트.jpg', 'meal-kit-18-68-main-1.jpg', '/images/product-seed/meal-kit-18-68/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-18-68-main-2.jpg', '/images/product-seed/meal-kit-18-68/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-18-68-detail-1.jpg', '/images/product-seed/meal-kit-18-68/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-18-68-detail-2.jpg', '/images/product-seed/meal-kit-18-68/detail-2.jpg', 0, 'DETAIL');

-- [69/150] 묵은지 김치찌개 키트 홈파티 19호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '묵은지 김치찌개 키트 홈파티 19호', 16000, 86, '<h3>묵은지 김치찌개 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '묵은지 김치찌개 키트.jpg', 'meal-kit-19-69-main-1.jpg', '/images/product-seed/meal-kit-19-69/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-19-69-main-2.jpg', '/images/product-seed/meal-kit-19-69/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-19-69-detail-1.jpg', '/images/product-seed/meal-kit-19-69/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-19-69-detail-2.jpg', '/images/product-seed/meal-kit-19-69/detail-2.jpg', 0, 'DETAIL');

-- [70/150] 불고기 전골 키트 홈파티 20호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '불고기 전골 키트 홈파티 20호', 18900, 103, '<h3>불고기 전골 키트 홈파티</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '불고기 전골 키트.jpg', 'meal-kit-20-70-main-1.jpg', '/images/product-seed/meal-kit-20-70/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-20-70-main-2.jpg', '/images/product-seed/meal-kit-20-70/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-20-70-detail-1.jpg', '/images/product-seed/meal-kit-20-70/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-20-70-detail-2.jpg', '/images/product-seed/meal-kit-20-70/detail-2.jpg', 0, 'DETAIL');

-- [71/150] 소고기 미역국 키트 집밥클래식 21호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '소고기 미역국 키트 집밥클래식 21호', 13400, 120, '<h3>소고기 미역국 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '소고기 미역국 키트.jpg', 'meal-kit-21-71-main-1.jpg', '/images/product-seed/meal-kit-21-71/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-21-71-main-2.jpg', '/images/product-seed/meal-kit-21-71/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-21-71-detail-1.jpg', '/images/product-seed/meal-kit-21-71/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-21-71-detail-2.jpg', '/images/product-seed/meal-kit-21-71/detail-2.jpg', 0, 'DETAIL');

-- [72/150] 차돌 된장찌개 키트 집밥클래식 22호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '차돌 된장찌개 키트 집밥클래식 22호', 15900, 137, '<h3>차돌 된장찌개 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '차돌 된장찌개 키트.jpg', 'meal-kit-22-72-main-1.jpg', '/images/product-seed/meal-kit-22-72/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-22-72-main-2.jpg', '/images/product-seed/meal-kit-22-72/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-22-72-detail-1.jpg', '/images/product-seed/meal-kit-22-72/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-22-72-detail-2.jpg', '/images/product-seed/meal-kit-22-72/detail-2.jpg', 0, 'DETAIL');

-- [73/150] 새우 알리오올리오 키트 집밥클래식 23호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '새우 알리오올리오 키트 집밥클래식 23호', 18000, 64, '<h3>새우 알리오올리오 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '새우 알리오올리오 키트.jpg', 'meal-kit-23-73-main-1.jpg', '/images/product-seed/meal-kit-23-73/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-23-73-main-2.jpg', '/images/product-seed/meal-kit-23-73/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-23-73-detail-1.jpg', '/images/product-seed/meal-kit-23-73/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-23-73-detail-2.jpg', '/images/product-seed/meal-kit-23-73/detail-2.jpg', 0, 'DETAIL');

-- [74/150] 부대찌개 키트 집밥클래식 24호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '부대찌개 키트 집밥클래식 24호', 15900, 81, '<h3>부대찌개 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '부대찌개 키트.jpg', 'meal-kit-24-74-main-1.jpg', '/images/product-seed/meal-kit-24-74/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-24-74-main-2.jpg', '/images/product-seed/meal-kit-24-74/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-24-74-detail-1.jpg', '/images/product-seed/meal-kit-24-74/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-24-74-detail-2.jpg', '/images/product-seed/meal-kit-24-74/detail-2.jpg', 0, 'DETAIL');

-- [75/150] 제육볶음 키트 집밥클래식 25호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '제육볶음 키트 집밥클래식 25호', 14400, 98, '<h3>제육볶음 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제육볶음 키트.jpg', 'meal-kit-25-75-main-1.jpg', '/images/product-seed/meal-kit-25-75/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-25-75-main-2.jpg', '/images/product-seed/meal-kit-25-75/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-25-75-detail-1.jpg', '/images/product-seed/meal-kit-25-75/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-25-75-detail-2.jpg', '/images/product-seed/meal-kit-25-75/detail-2.jpg', 0, 'DETAIL');

-- [76/150] 감바스 키트 집밥클래식 26호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '감바스 키트 집밥클래식 26호', 17900, 115, '<h3>감바스 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감바스 키트.jpg', 'meal-kit-26-76-main-1.jpg', '/images/product-seed/meal-kit-26-76/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-26-76-main-2.jpg', '/images/product-seed/meal-kit-26-76/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-26-76-detail-1.jpg', '/images/product-seed/meal-kit-26-76/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-26-76-detail-2.jpg', '/images/product-seed/meal-kit-26-76/detail-2.jpg', 0, 'DETAIL');

-- [77/150] 닭갈비 키트 집밥클래식 27호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '닭갈비 키트 집밥클래식 27호', 19400, 132, '<h3>닭갈비 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '닭갈비 키트.jpg', 'meal-kit-27-77-main-1.jpg', '/images/product-seed/meal-kit-27-77/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-27-77-main-2.jpg', '/images/product-seed/meal-kit-27-77/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-27-77-detail-1.jpg', '/images/product-seed/meal-kit-27-77/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-27-77-detail-2.jpg', '/images/product-seed/meal-kit-27-77/detail-2.jpg', 0, 'DETAIL');

-- [78/150] 해물순두부 키트 집밥클래식 28호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '해물순두부 키트 집밥클래식 28호', 14900, 59, '<h3>해물순두부 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '해물순두부 키트.jpg', 'meal-kit-28-78-main-1.jpg', '/images/product-seed/meal-kit-28-78/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-28-78-main-2.jpg', '/images/product-seed/meal-kit-28-78/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-28-78-detail-1.jpg', '/images/product-seed/meal-kit-28-78/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-28-78-detail-2.jpg', '/images/product-seed/meal-kit-28-78/detail-2.jpg', 0, 'DETAIL');

-- [79/150] 묵은지 김치찌개 키트 집밥클래식 29호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '묵은지 김치찌개 키트 집밥클래식 29호', 15000, 76, '<h3>묵은지 김치찌개 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '묵은지 김치찌개 키트.jpg', 'meal-kit-29-79-main-1.jpg', '/images/product-seed/meal-kit-29-79/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-29-79-main-2.jpg', '/images/product-seed/meal-kit-29-79/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-29-79-detail-1.jpg', '/images/product-seed/meal-kit-29-79/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-29-79-detail-2.jpg', '/images/product-seed/meal-kit-29-79/detail-2.jpg', 0, 'DETAIL');

-- [80/150] 불고기 전골 키트 집밥클래식 30호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '불고기 전골 키트 집밥클래식 30호', 19900, 93, '<h3>불고기 전골 키트 집밥클래식</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '불고기 전골 키트.jpg', 'meal-kit-30-80-main-1.jpg', '/images/product-seed/meal-kit-30-80/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-30-80-main-2.jpg', '/images/product-seed/meal-kit-30-80/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-30-80-detail-1.jpg', '/images/product-seed/meal-kit-30-80/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-30-80-detail-2.jpg', '/images/product-seed/meal-kit-30-80/detail-2.jpg', 0, 'DETAIL');

-- [81/150] 소고기 미역국 키트 매콤버전 31호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '소고기 미역국 키트 매콤버전 31호', 14400, 110, '<h3>소고기 미역국 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '소고기 미역국 키트.jpg', 'meal-kit-31-81-main-1.jpg', '/images/product-seed/meal-kit-31-81/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-31-81-main-2.jpg', '/images/product-seed/meal-kit-31-81/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-31-81-detail-1.jpg', '/images/product-seed/meal-kit-31-81/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-31-81-detail-2.jpg', '/images/product-seed/meal-kit-31-81/detail-2.jpg', 0, 'DETAIL');

-- [82/150] 차돌 된장찌개 키트 매콤버전 32호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '차돌 된장찌개 키트 매콤버전 32호', 14900, 127, '<h3>차돌 된장찌개 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '차돌 된장찌개 키트.jpg', 'meal-kit-32-82-main-1.jpg', '/images/product-seed/meal-kit-32-82/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-32-82-main-2.jpg', '/images/product-seed/meal-kit-32-82/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-32-82-detail-1.jpg', '/images/product-seed/meal-kit-32-82/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-32-82-detail-2.jpg', '/images/product-seed/meal-kit-32-82/detail-2.jpg', 0, 'DETAIL');

-- [83/150] 새우 알리오올리오 키트 매콤버전 33호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '새우 알리오올리오 키트 매콤버전 33호', 17000, 54, '<h3>새우 알리오올리오 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '새우 알리오올리오 키트.jpg', 'meal-kit-33-83-main-1.jpg', '/images/product-seed/meal-kit-33-83/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-33-83-main-2.jpg', '/images/product-seed/meal-kit-33-83/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-33-83-detail-1.jpg', '/images/product-seed/meal-kit-33-83/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-33-83-detail-2.jpg', '/images/product-seed/meal-kit-33-83/detail-2.jpg', 0, 'DETAIL');

-- [84/150] 부대찌개 키트 매콤버전 34호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '부대찌개 키트 매콤버전 34호', 16900, 71, '<h3>부대찌개 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '부대찌개 키트.jpg', 'meal-kit-34-84-main-1.jpg', '/images/product-seed/meal-kit-34-84/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-34-84-main-2.jpg', '/images/product-seed/meal-kit-34-84/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-34-84-detail-1.jpg', '/images/product-seed/meal-kit-34-84/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-34-84-detail-2.jpg', '/images/product-seed/meal-kit-34-84/detail-2.jpg', 0, 'DETAIL');

-- [85/150] 제육볶음 키트 매콤버전 35호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '제육볶음 키트 매콤버전 35호', 15400, 88, '<h3>제육볶음 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제육볶음 키트.jpg', 'meal-kit-35-85-main-1.jpg', '/images/product-seed/meal-kit-35-85/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-35-85-main-2.jpg', '/images/product-seed/meal-kit-35-85/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-35-85-detail-1.jpg', '/images/product-seed/meal-kit-35-85/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-35-85-detail-2.jpg', '/images/product-seed/meal-kit-35-85/detail-2.jpg', 0, 'DETAIL');

-- [86/150] 감바스 키트 매콤버전 36호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '감바스 키트 매콤버전 36호', 16900, 105, '<h3>감바스 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감바스 키트.jpg', 'meal-kit-36-86-main-1.jpg', '/images/product-seed/meal-kit-36-86/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-36-86-main-2.jpg', '/images/product-seed/meal-kit-36-86/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-36-86-detail-1.jpg', '/images/product-seed/meal-kit-36-86/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-36-86-detail-2.jpg', '/images/product-seed/meal-kit-36-86/detail-2.jpg', 0, 'DETAIL');

-- [87/150] 닭갈비 키트 매콤버전 37호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '닭갈비 키트 매콤버전 37호', 18400, 122, '<h3>닭갈비 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '닭갈비 키트.jpg', 'meal-kit-37-87-main-1.jpg', '/images/product-seed/meal-kit-37-87/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-37-87-main-2.jpg', '/images/product-seed/meal-kit-37-87/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-37-87-detail-1.jpg', '/images/product-seed/meal-kit-37-87/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-37-87-detail-2.jpg', '/images/product-seed/meal-kit-37-87/detail-2.jpg', 0, 'DETAIL');

-- [88/150] 해물순두부 키트 매콤버전 38호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '해물순두부 키트 매콤버전 38호', 15900, 139, '<h3>해물순두부 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '해물순두부 키트.jpg', 'meal-kit-38-88-main-1.jpg', '/images/product-seed/meal-kit-38-88/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-38-88-main-2.jpg', '/images/product-seed/meal-kit-38-88/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-38-88-detail-1.jpg', '/images/product-seed/meal-kit-38-88/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-38-88-detail-2.jpg', '/images/product-seed/meal-kit-38-88/detail-2.jpg', 0, 'DETAIL');

-- [89/150] 묵은지 김치찌개 키트 매콤버전 39호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '묵은지 김치찌개 키트 매콤버전 39호', 16000, 66, '<h3>묵은지 김치찌개 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '묵은지 김치찌개 키트.jpg', 'meal-kit-39-89-main-1.jpg', '/images/product-seed/meal-kit-39-89/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-39-89-main-2.jpg', '/images/product-seed/meal-kit-39-89/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-39-89-detail-1.jpg', '/images/product-seed/meal-kit-39-89/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-39-89-detail-2.jpg', '/images/product-seed/meal-kit-39-89/detail-2.jpg', 0, 'DETAIL');

-- [90/150] 불고기 전골 키트 매콤버전 40호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '불고기 전골 키트 매콤버전 40호', 18900, 83, '<h3>불고기 전골 키트 매콤버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '불고기 전골 키트.jpg', 'meal-kit-40-90-main-1.jpg', '/images/product-seed/meal-kit-40-90/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-40-90-main-2.jpg', '/images/product-seed/meal-kit-40-90/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-40-90-detail-1.jpg', '/images/product-seed/meal-kit-40-90/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-40-90-detail-2.jpg', '/images/product-seed/meal-kit-40-90/detail-2.jpg', 0, 'DETAIL');

-- [91/150] 소고기 미역국 키트 담백버전 41호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '소고기 미역국 키트 담백버전 41호', 13400, 100, '<h3>소고기 미역국 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '소고기 미역국 키트.jpg', 'meal-kit-41-91-main-1.jpg', '/images/product-seed/meal-kit-41-91/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-41-91-main-2.jpg', '/images/product-seed/meal-kit-41-91/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-41-91-detail-1.jpg', '/images/product-seed/meal-kit-41-91/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-41-91-detail-2.jpg', '/images/product-seed/meal-kit-41-91/detail-2.jpg', 0, 'DETAIL');

-- [92/150] 차돌 된장찌개 키트 담백버전 42호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '차돌 된장찌개 키트 담백버전 42호', 15900, 117, '<h3>차돌 된장찌개 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '차돌 된장찌개 키트.jpg', 'meal-kit-42-92-main-1.jpg', '/images/product-seed/meal-kit-42-92/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-42-92-main-2.jpg', '/images/product-seed/meal-kit-42-92/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-42-92-detail-1.jpg', '/images/product-seed/meal-kit-42-92/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-42-92-detail-2.jpg', '/images/product-seed/meal-kit-42-92/detail-2.jpg', 0, 'DETAIL');

-- [93/150] 새우 알리오올리오 키트 담백버전 43호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '새우 알리오올리오 키트 담백버전 43호', 18000, 134, '<h3>새우 알리오올리오 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '새우 알리오올리오 키트.jpg', 'meal-kit-43-93-main-1.jpg', '/images/product-seed/meal-kit-43-93/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-43-93-main-2.jpg', '/images/product-seed/meal-kit-43-93/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-43-93-detail-1.jpg', '/images/product-seed/meal-kit-43-93/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-43-93-detail-2.jpg', '/images/product-seed/meal-kit-43-93/detail-2.jpg', 0, 'DETAIL');

-- [94/150] 부대찌개 키트 담백버전 44호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '부대찌개 키트 담백버전 44호', 15900, 61, '<h3>부대찌개 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '부대찌개 키트.jpg', 'meal-kit-44-94-main-1.jpg', '/images/product-seed/meal-kit-44-94/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-44-94-main-2.jpg', '/images/product-seed/meal-kit-44-94/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-44-94-detail-1.jpg', '/images/product-seed/meal-kit-44-94/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-44-94-detail-2.jpg', '/images/product-seed/meal-kit-44-94/detail-2.jpg', 0, 'DETAIL');

-- [95/150] 제육볶음 키트 담백버전 45호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '제육볶음 키트 담백버전 45호', 14400, 78, '<h3>제육볶음 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '제육볶음 키트.jpg', 'meal-kit-45-95-main-1.jpg', '/images/product-seed/meal-kit-45-95/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-45-95-main-2.jpg', '/images/product-seed/meal-kit-45-95/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-45-95-detail-1.jpg', '/images/product-seed/meal-kit-45-95/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-45-95-detail-2.jpg', '/images/product-seed/meal-kit-45-95/detail-2.jpg', 0, 'DETAIL');

-- [96/150] 감바스 키트 담백버전 46호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '감바스 키트 담백버전 46호', 17900, 95, '<h3>감바스 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '감바스 키트.jpg', 'meal-kit-46-96-main-1.jpg', '/images/product-seed/meal-kit-46-96/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-46-96-main-2.jpg', '/images/product-seed/meal-kit-46-96/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-46-96-detail-1.jpg', '/images/product-seed/meal-kit-46-96/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-46-96-detail-2.jpg', '/images/product-seed/meal-kit-46-96/detail-2.jpg', 0, 'DETAIL');

-- [97/150] 닭갈비 키트 담백버전 47호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '닭갈비 키트 담백버전 47호', 19400, 112, '<h3>닭갈비 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '닭갈비 키트.jpg', 'meal-kit-47-97-main-1.jpg', '/images/product-seed/meal-kit-47-97/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-47-97-main-2.jpg', '/images/product-seed/meal-kit-47-97/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-47-97-detail-1.jpg', '/images/product-seed/meal-kit-47-97/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-47-97-detail-2.jpg', '/images/product-seed/meal-kit-47-97/detail-2.jpg', 0, 'DETAIL');

-- [98/150] 해물순두부 키트 담백버전 48호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '해물순두부 키트 담백버전 48호', 14900, 129, '<h3>해물순두부 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '해물순두부 키트.jpg', 'meal-kit-48-98-main-1.jpg', '/images/product-seed/meal-kit-48-98/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-48-98-main-2.jpg', '/images/product-seed/meal-kit-48-98/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-48-98-detail-1.jpg', '/images/product-seed/meal-kit-48-98/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-48-98-detail-2.jpg', '/images/product-seed/meal-kit-48-98/detail-2.jpg', 0, 'DETAIL');

-- [99/150] 묵은지 김치찌개 키트 담백버전 49호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '묵은지 김치찌개 키트 담백버전 49호', 15000, 56, '<h3>묵은지 김치찌개 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '묵은지 김치찌개 키트.jpg', 'meal-kit-49-99-main-1.jpg', '/images/product-seed/meal-kit-49-99/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-49-99-main-2.jpg', '/images/product-seed/meal-kit-49-99/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-49-99-detail-1.jpg', '/images/product-seed/meal-kit-49-99/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-49-99-detail-2.jpg', '/images/product-seed/meal-kit-49-99/detail-2.jpg', 0, 'DETAIL');

-- [100/150] 불고기 전골 키트 담백버전 50호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('MEAL_KIT', '불고기 전골 키트 담백버전 50호', 19900, 73, '<h3>불고기 전골 키트 담백버전</h3><p>손질 재료와 양념이 동봉되어 누구나 빠르게 완성할 수 있는 밀키트입니다.</p><ul><li>권장 인원: 2~3인분</li><li>조리시간: 약 10~15분</li><li>구성: 소스/주재료/가니시</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '불고기 전골 키트.jpg', 'meal-kit-50-100-main-1.jpg', '/images/product-seed/meal-kit-50-100/main-1.jpg', 1, 'MAIN'),
(@pid, '간편 조리.jpg', 'meal-kit-50-100-main-2.jpg', '/images/product-seed/meal-kit-50-100/main-2.jpg', 0, 'MAIN'),
(@pid, '구성품 안내.jpg', 'meal-kit-50-100-detail-1.jpg', '/images/product-seed/meal-kit-50-100/detail-1.jpg', 0, 'DETAIL'),
(@pid, '조리 가이드.jpg', 'meal-kit-50-100-detail-2.jpg', '/images/product-seed/meal-kit-50-100/detail-2.jpg', 0, 'DETAIL');

-- [101/150] 인덕션 프라이팬 28cm 데일리 1호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '인덕션 프라이팬 28cm 데일리 1호', 29600, 40, '<h3>인덕션 프라이팬 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 28cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '인덕션 프라이팬.jpg', 'kitchen-supply-28cm-1-101-main-1.jpg', '/images/product-seed/kitchen-supply-28cm-1-101/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-28cm-1-101-main-2.jpg', '/images/product-seed/kitchen-supply-28cm-1-101/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-28cm-1-101-detail-1.jpg', '/images/product-seed/kitchen-supply-28cm-1-101/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-28cm-1-101-detail-2.jpg', '/images/product-seed/kitchen-supply-28cm-1-101/detail-2.jpg', 0, 'DETAIL');

-- [102/150] 스테인리스 냄비 20cm 데일리 2호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스테인리스 냄비 20cm 데일리 2호', 33300, 57, '<h3>스테인리스 냄비 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 20cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스테인리스 냄비.jpg', 'kitchen-supply-20cm-2-102-main-1.jpg', '/images/product-seed/kitchen-supply-20cm-2-102/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-20cm-2-102-main-2.jpg', '/images/product-seed/kitchen-supply-20cm-2-102/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-20cm-2-102-detail-1.jpg', '/images/product-seed/kitchen-supply-20cm-2-102/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-20cm-2-102-detail-2.jpg', '/images/product-seed/kitchen-supply-20cm-2-102/detail-2.jpg', 0, 'DETAIL');

-- [103/150] 내열 유리 밀폐용기 6종세트 데일리 3호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '내열 유리 밀폐용기 6종세트 데일리 3호', 24000, 74, '<h3>내열 유리 밀폐용기 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 6종세트</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '내열 유리 밀폐용기.jpg', 'kitchen-supply-6-3-103-main-1.jpg', '/images/product-seed/kitchen-supply-6-3-103/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-6-3-103-main-2.jpg', '/images/product-seed/kitchen-supply-6-3-103/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-6-3-103-detail-1.jpg', '/images/product-seed/kitchen-supply-6-3-103/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-6-3-103-detail-2.jpg', '/images/product-seed/kitchen-supply-6-3-103/detail-2.jpg', 0, 'DETAIL');

-- [104/150] 실리콘 조리도구 세트 7종 데일리 4호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '실리콘 조리도구 세트 7종 데일리 4호', 22700, 91, '<h3>실리콘 조리도구 세트 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 7종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '실리콘 조리도구 세트.jpg', 'kitchen-supply-7-4-104-main-1.jpg', '/images/product-seed/kitchen-supply-7-4-104/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-7-4-104-main-2.jpg', '/images/product-seed/kitchen-supply-7-4-104/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-7-4-104-detail-1.jpg', '/images/product-seed/kitchen-supply-7-4-104/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-7-4-104-detail-2.jpg', '/images/product-seed/kitchen-supply-7-4-104/detail-2.jpg', 0, 'DETAIL');

-- [105/150] 원목 도마 대형 데일리 5호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '원목 도마 대형 데일리 5호', 29400, 108, '<h3>원목 도마 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 대형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '원목 도마.jpg', 'kitchen-supply-5-105-main-1.jpg', '/images/product-seed/kitchen-supply-5-105/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-5-105-main-2.jpg', '/images/product-seed/kitchen-supply-5-105/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-5-105-detail-1.jpg', '/images/product-seed/kitchen-supply-5-105/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-5-105-detail-2.jpg', '/images/product-seed/kitchen-supply-5-105/detail-2.jpg', 0, 'DETAIL');

-- [106/150] 셰프 나이프 8인치 데일리 6호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '셰프 나이프 8인치 데일리 6호', 34900, 55, '<h3>셰프 나이프 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 8인치</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '셰프 나이프.jpg', 'kitchen-supply-8-6-106-main-1.jpg', '/images/product-seed/kitchen-supply-8-6-106/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-8-6-106-main-2.jpg', '/images/product-seed/kitchen-supply-8-6-106/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-8-6-106-detail-1.jpg', '/images/product-seed/kitchen-supply-8-6-106/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-8-6-106-detail-2.jpg', '/images/product-seed/kitchen-supply-8-6-106/detail-2.jpg', 0, 'DETAIL');

-- [107/150] 계량컵/스푼 세트 10종 데일리 7호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '계량컵/스푼 세트 10종 데일리 7호', 13600, 72, '<h3>계량컵/스푼 세트 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 10종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '계량컵/스푼 세트.jpg', 'kitchen-supply-10-7-107-main-1.jpg', '/images/product-seed/kitchen-supply-10-7-107/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-10-7-107-main-2.jpg', '/images/product-seed/kitchen-supply-10-7-107/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-10-7-107-detail-1.jpg', '/images/product-seed/kitchen-supply-10-7-107/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-10-7-107-detail-2.jpg', '/images/product-seed/kitchen-supply-10-7-107/detail-2.jpg', 0, 'DETAIL');

-- [108/150] 스텐 채반볼 세트 3종 데일리 8호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스텐 채반볼 세트 3종 데일리 8호', 25300, 89, '<h3>스텐 채반볼 세트 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 3종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스텐 채반볼 세트.jpg', 'kitchen-supply-3-8-108-main-1.jpg', '/images/product-seed/kitchen-supply-3-8-108/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-3-8-108-main-2.jpg', '/images/product-seed/kitchen-supply-3-8-108/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-3-8-108-detail-1.jpg', '/images/product-seed/kitchen-supply-3-8-108/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-3-8-108-detail-2.jpg', '/images/product-seed/kitchen-supply-3-8-108/detail-2.jpg', 0, 'DETAIL');

-- [109/150] 오븐용 트레이 2종 데일리 9호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '오븐용 트레이 2종 데일리 9호', 20000, 106, '<h3>오븐용 트레이 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 2종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '오븐용 트레이.jpg', 'kitchen-supply-2-9-109-main-1.jpg', '/images/product-seed/kitchen-supply-2-9-109/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-2-9-109-main-2.jpg', '/images/product-seed/kitchen-supply-2-9-109/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-2-9-109-detail-1.jpg', '/images/product-seed/kitchen-supply-2-9-109/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-2-9-109-detail-2.jpg', '/images/product-seed/kitchen-supply-2-9-109/detail-2.jpg', 0, 'DETAIL');

-- [110/150] 주방 정리 랙 확장형 데일리 10호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '주방 정리 랙 확장형 데일리 10호', 29700, 53, '<h3>주방 정리 랙 데일리</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 확장형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '주방 정리 랙.jpg', 'kitchen-supply-10-110-main-1.jpg', '/images/product-seed/kitchen-supply-10-110/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-10-110-main-2.jpg', '/images/product-seed/kitchen-supply-10-110/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-10-110-detail-1.jpg', '/images/product-seed/kitchen-supply-10-110/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-10-110-detail-2.jpg', '/images/product-seed/kitchen-supply-10-110/detail-2.jpg', 0, 'DETAIL');

-- [111/150] 인덕션 프라이팬 28cm 프로라인 11호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '인덕션 프라이팬 28cm 프로라인 11호', 32400, 70, '<h3>인덕션 프라이팬 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 28cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '인덕션 프라이팬.jpg', 'kitchen-supply-28cm-11-111-main-1.jpg', '/images/product-seed/kitchen-supply-28cm-11-111/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-28cm-11-111-main-2.jpg', '/images/product-seed/kitchen-supply-28cm-11-111/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-28cm-11-111-detail-1.jpg', '/images/product-seed/kitchen-supply-28cm-11-111/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-28cm-11-111-detail-2.jpg', '/images/product-seed/kitchen-supply-28cm-11-111/detail-2.jpg', 0, 'DETAIL');

-- [112/150] 스테인리스 냄비 20cm 프로라인 12호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스테인리스 냄비 20cm 프로라인 12호', 31900, 87, '<h3>스테인리스 냄비 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 20cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스테인리스 냄비.jpg', 'kitchen-supply-20cm-12-112-main-1.jpg', '/images/product-seed/kitchen-supply-20cm-12-112/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-20cm-12-112-main-2.jpg', '/images/product-seed/kitchen-supply-20cm-12-112/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-20cm-12-112-detail-1.jpg', '/images/product-seed/kitchen-supply-20cm-12-112/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-20cm-12-112-detail-2.jpg', '/images/product-seed/kitchen-supply-20cm-12-112/detail-2.jpg', 0, 'DETAIL');

-- [113/150] 내열 유리 밀폐용기 6종세트 프로라인 13호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '내열 유리 밀폐용기 6종세트 프로라인 13호', 22600, 104, '<h3>내열 유리 밀폐용기 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 6종세트</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '내열 유리 밀폐용기.jpg', 'kitchen-supply-6-13-113-main-1.jpg', '/images/product-seed/kitchen-supply-6-13-113/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-6-13-113-main-2.jpg', '/images/product-seed/kitchen-supply-6-13-113/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-6-13-113-detail-1.jpg', '/images/product-seed/kitchen-supply-6-13-113/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-6-13-113-detail-2.jpg', '/images/product-seed/kitchen-supply-6-13-113/detail-2.jpg', 0, 'DETAIL');

-- [114/150] 실리콘 조리도구 세트 7종 프로라인 14호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '실리콘 조리도구 세트 7종 프로라인 14호', 21300, 51, '<h3>실리콘 조리도구 세트 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 7종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '실리콘 조리도구 세트.jpg', 'kitchen-supply-7-14-114-main-1.jpg', '/images/product-seed/kitchen-supply-7-14-114/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-7-14-114-main-2.jpg', '/images/product-seed/kitchen-supply-7-14-114/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-7-14-114-detail-1.jpg', '/images/product-seed/kitchen-supply-7-14-114/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-7-14-114-detail-2.jpg', '/images/product-seed/kitchen-supply-7-14-114/detail-2.jpg', 0, 'DETAIL');

-- [115/150] 원목 도마 대형 프로라인 15호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '원목 도마 대형 프로라인 15호', 28000, 68, '<h3>원목 도마 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 대형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '원목 도마.jpg', 'kitchen-supply-15-115-main-1.jpg', '/images/product-seed/kitchen-supply-15-115/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-15-115-main-2.jpg', '/images/product-seed/kitchen-supply-15-115/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-15-115-detail-1.jpg', '/images/product-seed/kitchen-supply-15-115/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-15-115-detail-2.jpg', '/images/product-seed/kitchen-supply-15-115/detail-2.jpg', 0, 'DETAIL');

-- [116/150] 셰프 나이프 8인치 프로라인 16호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '셰프 나이프 8인치 프로라인 16호', 37700, 85, '<h3>셰프 나이프 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 8인치</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '셰프 나이프.jpg', 'kitchen-supply-8-16-116-main-1.jpg', '/images/product-seed/kitchen-supply-8-16-116/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-8-16-116-main-2.jpg', '/images/product-seed/kitchen-supply-8-16-116/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-8-16-116-detail-1.jpg', '/images/product-seed/kitchen-supply-8-16-116/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-8-16-116-detail-2.jpg', '/images/product-seed/kitchen-supply-8-16-116/detail-2.jpg', 0, 'DETAIL');

-- [117/150] 계량컵/스푼 세트 10종 프로라인 17호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '계량컵/스푼 세트 10종 프로라인 17호', 16400, 102, '<h3>계량컵/스푼 세트 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 10종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '계량컵/스푼 세트.jpg', 'kitchen-supply-10-17-117-main-1.jpg', '/images/product-seed/kitchen-supply-10-17-117/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-10-17-117-main-2.jpg', '/images/product-seed/kitchen-supply-10-17-117/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-10-17-117-detail-1.jpg', '/images/product-seed/kitchen-supply-10-17-117/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-10-17-117-detail-2.jpg', '/images/product-seed/kitchen-supply-10-17-117/detail-2.jpg', 0, 'DETAIL');

-- [118/150] 스텐 채반볼 세트 3종 프로라인 18호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스텐 채반볼 세트 3종 프로라인 18호', 23900, 49, '<h3>스텐 채반볼 세트 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 3종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스텐 채반볼 세트.jpg', 'kitchen-supply-3-18-118-main-1.jpg', '/images/product-seed/kitchen-supply-3-18-118/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-3-18-118-main-2.jpg', '/images/product-seed/kitchen-supply-3-18-118/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-3-18-118-detail-1.jpg', '/images/product-seed/kitchen-supply-3-18-118/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-3-18-118-detail-2.jpg', '/images/product-seed/kitchen-supply-3-18-118/detail-2.jpg', 0, 'DETAIL');

-- [119/150] 오븐용 트레이 2종 프로라인 19호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '오븐용 트레이 2종 프로라인 19호', 18600, 66, '<h3>오븐용 트레이 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 2종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '오븐용 트레이.jpg', 'kitchen-supply-2-19-119-main-1.jpg', '/images/product-seed/kitchen-supply-2-19-119/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-2-19-119-main-2.jpg', '/images/product-seed/kitchen-supply-2-19-119/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-2-19-119-detail-1.jpg', '/images/product-seed/kitchen-supply-2-19-119/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-2-19-119-detail-2.jpg', '/images/product-seed/kitchen-supply-2-19-119/detail-2.jpg', 0, 'DETAIL');

-- [120/150] 주방 정리 랙 확장형 프로라인 20호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '주방 정리 랙 확장형 프로라인 20호', 28300, 83, '<h3>주방 정리 랙 프로라인</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 확장형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '주방 정리 랙.jpg', 'kitchen-supply-20-120-main-1.jpg', '/images/product-seed/kitchen-supply-20-120/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-20-120-main-2.jpg', '/images/product-seed/kitchen-supply-20-120/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-20-120-detail-1.jpg', '/images/product-seed/kitchen-supply-20-120/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-20-120-detail-2.jpg', '/images/product-seed/kitchen-supply-20-120/detail-2.jpg', 0, 'DETAIL');

-- [121/150] 인덕션 프라이팬 28cm 컴팩트 21호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '인덕션 프라이팬 28cm 컴팩트 21호', 31000, 100, '<h3>인덕션 프라이팬 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 28cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '인덕션 프라이팬.jpg', 'kitchen-supply-28cm-21-121-main-1.jpg', '/images/product-seed/kitchen-supply-28cm-21-121/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-28cm-21-121-main-2.jpg', '/images/product-seed/kitchen-supply-28cm-21-121/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-28cm-21-121-detail-1.jpg', '/images/product-seed/kitchen-supply-28cm-21-121/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-28cm-21-121-detail-2.jpg', '/images/product-seed/kitchen-supply-28cm-21-121/detail-2.jpg', 0, 'DETAIL');

-- [122/150] 스테인리스 냄비 20cm 컴팩트 22호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스테인리스 냄비 20cm 컴팩트 22호', 34700, 47, '<h3>스테인리스 냄비 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 20cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스테인리스 냄비.jpg', 'kitchen-supply-20cm-22-122-main-1.jpg', '/images/product-seed/kitchen-supply-20cm-22-122/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-20cm-22-122-main-2.jpg', '/images/product-seed/kitchen-supply-20cm-22-122/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-20cm-22-122-detail-1.jpg', '/images/product-seed/kitchen-supply-20cm-22-122/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-20cm-22-122-detail-2.jpg', '/images/product-seed/kitchen-supply-20cm-22-122/detail-2.jpg', 0, 'DETAIL');

-- [123/150] 내열 유리 밀폐용기 6종세트 컴팩트 23호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '내열 유리 밀폐용기 6종세트 컴팩트 23호', 25400, 64, '<h3>내열 유리 밀폐용기 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 6종세트</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '내열 유리 밀폐용기.jpg', 'kitchen-supply-6-23-123-main-1.jpg', '/images/product-seed/kitchen-supply-6-23-123/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-6-23-123-main-2.jpg', '/images/product-seed/kitchen-supply-6-23-123/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-6-23-123-detail-1.jpg', '/images/product-seed/kitchen-supply-6-23-123/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-6-23-123-detail-2.jpg', '/images/product-seed/kitchen-supply-6-23-123/detail-2.jpg', 0, 'DETAIL');

-- [124/150] 실리콘 조리도구 세트 7종 컴팩트 24호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '실리콘 조리도구 세트 7종 컴팩트 24호', 19900, 81, '<h3>실리콘 조리도구 세트 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 7종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '실리콘 조리도구 세트.jpg', 'kitchen-supply-7-24-124-main-1.jpg', '/images/product-seed/kitchen-supply-7-24-124/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-7-24-124-main-2.jpg', '/images/product-seed/kitchen-supply-7-24-124/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-7-24-124-detail-1.jpg', '/images/product-seed/kitchen-supply-7-24-124/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-7-24-124-detail-2.jpg', '/images/product-seed/kitchen-supply-7-24-124/detail-2.jpg', 0, 'DETAIL');

-- [125/150] 원목 도마 대형 컴팩트 25호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '원목 도마 대형 컴팩트 25호', 26600, 98, '<h3>원목 도마 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 대형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '원목 도마.jpg', 'kitchen-supply-25-125-main-1.jpg', '/images/product-seed/kitchen-supply-25-125/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-25-125-main-2.jpg', '/images/product-seed/kitchen-supply-25-125/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-25-125-detail-1.jpg', '/images/product-seed/kitchen-supply-25-125/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-25-125-detail-2.jpg', '/images/product-seed/kitchen-supply-25-125/detail-2.jpg', 0, 'DETAIL');

-- [126/150] 셰프 나이프 8인치 컴팩트 26호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '셰프 나이프 8인치 컴팩트 26호', 36300, 45, '<h3>셰프 나이프 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 8인치</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '셰프 나이프.jpg', 'kitchen-supply-8-26-126-main-1.jpg', '/images/product-seed/kitchen-supply-8-26-126/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-8-26-126-main-2.jpg', '/images/product-seed/kitchen-supply-8-26-126/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-8-26-126-detail-1.jpg', '/images/product-seed/kitchen-supply-8-26-126/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-8-26-126-detail-2.jpg', '/images/product-seed/kitchen-supply-8-26-126/detail-2.jpg', 0, 'DETAIL');

-- [127/150] 계량컵/스푼 세트 10종 컴팩트 27호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '계량컵/스푼 세트 10종 컴팩트 27호', 15000, 62, '<h3>계량컵/스푼 세트 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 10종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '계량컵/스푼 세트.jpg', 'kitchen-supply-10-27-127-main-1.jpg', '/images/product-seed/kitchen-supply-10-27-127/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-10-27-127-main-2.jpg', '/images/product-seed/kitchen-supply-10-27-127/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-10-27-127-detail-1.jpg', '/images/product-seed/kitchen-supply-10-27-127/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-10-27-127-detail-2.jpg', '/images/product-seed/kitchen-supply-10-27-127/detail-2.jpg', 0, 'DETAIL');

-- [128/150] 스텐 채반볼 세트 3종 컴팩트 28호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스텐 채반볼 세트 3종 컴팩트 28호', 26700, 79, '<h3>스텐 채반볼 세트 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 3종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스텐 채반볼 세트.jpg', 'kitchen-supply-3-28-128-main-1.jpg', '/images/product-seed/kitchen-supply-3-28-128/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-3-28-128-main-2.jpg', '/images/product-seed/kitchen-supply-3-28-128/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-3-28-128-detail-1.jpg', '/images/product-seed/kitchen-supply-3-28-128/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-3-28-128-detail-2.jpg', '/images/product-seed/kitchen-supply-3-28-128/detail-2.jpg', 0, 'DETAIL');

-- [129/150] 오븐용 트레이 2종 컴팩트 29호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '오븐용 트레이 2종 컴팩트 29호', 21400, 96, '<h3>오븐용 트레이 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 2종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '오븐용 트레이.jpg', 'kitchen-supply-2-29-129-main-1.jpg', '/images/product-seed/kitchen-supply-2-29-129/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-2-29-129-main-2.jpg', '/images/product-seed/kitchen-supply-2-29-129/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-2-29-129-detail-1.jpg', '/images/product-seed/kitchen-supply-2-29-129/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-2-29-129-detail-2.jpg', '/images/product-seed/kitchen-supply-2-29-129/detail-2.jpg', 0, 'DETAIL');

-- [130/150] 주방 정리 랙 확장형 컴팩트 30호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '주방 정리 랙 확장형 컴팩트 30호', 26900, 43, '<h3>주방 정리 랙 컴팩트</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 확장형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '주방 정리 랙.jpg', 'kitchen-supply-30-130-main-1.jpg', '/images/product-seed/kitchen-supply-30-130/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-30-130-main-2.jpg', '/images/product-seed/kitchen-supply-30-130/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-30-130-detail-1.jpg', '/images/product-seed/kitchen-supply-30-130/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-30-130-detail-2.jpg', '/images/product-seed/kitchen-supply-30-130/detail-2.jpg', 0, 'DETAIL');

-- [131/150] 인덕션 프라이팬 28cm 모던 31호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '인덕션 프라이팬 28cm 모던 31호', 29600, 60, '<h3>인덕션 프라이팬 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 28cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '인덕션 프라이팬.jpg', 'kitchen-supply-28cm-31-131-main-1.jpg', '/images/product-seed/kitchen-supply-28cm-31-131/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-28cm-31-131-main-2.jpg', '/images/product-seed/kitchen-supply-28cm-31-131/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-28cm-31-131-detail-1.jpg', '/images/product-seed/kitchen-supply-28cm-31-131/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-28cm-31-131-detail-2.jpg', '/images/product-seed/kitchen-supply-28cm-31-131/detail-2.jpg', 0, 'DETAIL');

-- [132/150] 스테인리스 냄비 20cm 모던 32호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스테인리스 냄비 20cm 모던 32호', 33300, 77, '<h3>스테인리스 냄비 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 20cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스테인리스 냄비.jpg', 'kitchen-supply-20cm-32-132-main-1.jpg', '/images/product-seed/kitchen-supply-20cm-32-132/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-20cm-32-132-main-2.jpg', '/images/product-seed/kitchen-supply-20cm-32-132/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-20cm-32-132-detail-1.jpg', '/images/product-seed/kitchen-supply-20cm-32-132/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-20cm-32-132-detail-2.jpg', '/images/product-seed/kitchen-supply-20cm-32-132/detail-2.jpg', 0, 'DETAIL');

-- [133/150] 내열 유리 밀폐용기 6종세트 모던 33호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '내열 유리 밀폐용기 6종세트 모던 33호', 24000, 94, '<h3>내열 유리 밀폐용기 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 6종세트</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '내열 유리 밀폐용기.jpg', 'kitchen-supply-6-33-133-main-1.jpg', '/images/product-seed/kitchen-supply-6-33-133/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-6-33-133-main-2.jpg', '/images/product-seed/kitchen-supply-6-33-133/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-6-33-133-detail-1.jpg', '/images/product-seed/kitchen-supply-6-33-133/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-6-33-133-detail-2.jpg', '/images/product-seed/kitchen-supply-6-33-133/detail-2.jpg', 0, 'DETAIL');

-- [134/150] 실리콘 조리도구 세트 7종 모던 34호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '실리콘 조리도구 세트 7종 모던 34호', 22700, 41, '<h3>실리콘 조리도구 세트 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 7종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '실리콘 조리도구 세트.jpg', 'kitchen-supply-7-34-134-main-1.jpg', '/images/product-seed/kitchen-supply-7-34-134/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-7-34-134-main-2.jpg', '/images/product-seed/kitchen-supply-7-34-134/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-7-34-134-detail-1.jpg', '/images/product-seed/kitchen-supply-7-34-134/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-7-34-134-detail-2.jpg', '/images/product-seed/kitchen-supply-7-34-134/detail-2.jpg', 0, 'DETAIL');

-- [135/150] 원목 도마 대형 모던 35호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '원목 도마 대형 모던 35호', 29400, 58, '<h3>원목 도마 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 대형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '원목 도마.jpg', 'kitchen-supply-35-135-main-1.jpg', '/images/product-seed/kitchen-supply-35-135/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-35-135-main-2.jpg', '/images/product-seed/kitchen-supply-35-135/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-35-135-detail-1.jpg', '/images/product-seed/kitchen-supply-35-135/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-35-135-detail-2.jpg', '/images/product-seed/kitchen-supply-35-135/detail-2.jpg', 0, 'DETAIL');

-- [136/150] 셰프 나이프 8인치 모던 36호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '셰프 나이프 8인치 모던 36호', 34900, 75, '<h3>셰프 나이프 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 8인치</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '셰프 나이프.jpg', 'kitchen-supply-8-36-136-main-1.jpg', '/images/product-seed/kitchen-supply-8-36-136/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-8-36-136-main-2.jpg', '/images/product-seed/kitchen-supply-8-36-136/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-8-36-136-detail-1.jpg', '/images/product-seed/kitchen-supply-8-36-136/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-8-36-136-detail-2.jpg', '/images/product-seed/kitchen-supply-8-36-136/detail-2.jpg', 0, 'DETAIL');

-- [137/150] 계량컵/스푼 세트 10종 모던 37호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '계량컵/스푼 세트 10종 모던 37호', 13600, 92, '<h3>계량컵/스푼 세트 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 10종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '계량컵/스푼 세트.jpg', 'kitchen-supply-10-37-137-main-1.jpg', '/images/product-seed/kitchen-supply-10-37-137/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-10-37-137-main-2.jpg', '/images/product-seed/kitchen-supply-10-37-137/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-10-37-137-detail-1.jpg', '/images/product-seed/kitchen-supply-10-37-137/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-10-37-137-detail-2.jpg', '/images/product-seed/kitchen-supply-10-37-137/detail-2.jpg', 0, 'DETAIL');

-- [138/150] 스텐 채반볼 세트 3종 모던 38호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스텐 채반볼 세트 3종 모던 38호', 25300, 109, '<h3>스텐 채반볼 세트 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 3종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스텐 채반볼 세트.jpg', 'kitchen-supply-3-38-138-main-1.jpg', '/images/product-seed/kitchen-supply-3-38-138/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-3-38-138-main-2.jpg', '/images/product-seed/kitchen-supply-3-38-138/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-3-38-138-detail-1.jpg', '/images/product-seed/kitchen-supply-3-38-138/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-3-38-138-detail-2.jpg', '/images/product-seed/kitchen-supply-3-38-138/detail-2.jpg', 0, 'DETAIL');

-- [139/150] 오븐용 트레이 2종 모던 39호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '오븐용 트레이 2종 모던 39호', 20000, 56, '<h3>오븐용 트레이 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 2종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '오븐용 트레이.jpg', 'kitchen-supply-2-39-139-main-1.jpg', '/images/product-seed/kitchen-supply-2-39-139/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-2-39-139-main-2.jpg', '/images/product-seed/kitchen-supply-2-39-139/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-2-39-139-detail-1.jpg', '/images/product-seed/kitchen-supply-2-39-139/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-2-39-139-detail-2.jpg', '/images/product-seed/kitchen-supply-2-39-139/detail-2.jpg', 0, 'DETAIL');

-- [140/150] 주방 정리 랙 확장형 모던 40호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '주방 정리 랙 확장형 모던 40호', 29700, 73, '<h3>주방 정리 랙 모던</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 확장형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '주방 정리 랙.jpg', 'kitchen-supply-40-140-main-1.jpg', '/images/product-seed/kitchen-supply-40-140/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-40-140-main-2.jpg', '/images/product-seed/kitchen-supply-40-140/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-40-140-detail-1.jpg', '/images/product-seed/kitchen-supply-40-140/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-40-140-detail-2.jpg', '/images/product-seed/kitchen-supply-40-140/detail-2.jpg', 0, 'DETAIL');

-- [141/150] 인덕션 프라이팬 28cm 프리미엄 41호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '인덕션 프라이팬 28cm 프리미엄 41호', 32400, 90, '<h3>인덕션 프라이팬 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 28cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '인덕션 프라이팬.jpg', 'kitchen-supply-28cm-41-141-main-1.jpg', '/images/product-seed/kitchen-supply-28cm-41-141/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-28cm-41-141-main-2.jpg', '/images/product-seed/kitchen-supply-28cm-41-141/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-28cm-41-141-detail-1.jpg', '/images/product-seed/kitchen-supply-28cm-41-141/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-28cm-41-141-detail-2.jpg', '/images/product-seed/kitchen-supply-28cm-41-141/detail-2.jpg', 0, 'DETAIL');

-- [142/150] 스테인리스 냄비 20cm 프리미엄 42호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스테인리스 냄비 20cm 프리미엄 42호', 31900, 107, '<h3>스테인리스 냄비 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 20cm</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스테인리스 냄비.jpg', 'kitchen-supply-20cm-42-142-main-1.jpg', '/images/product-seed/kitchen-supply-20cm-42-142/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-20cm-42-142-main-2.jpg', '/images/product-seed/kitchen-supply-20cm-42-142/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-20cm-42-142-detail-1.jpg', '/images/product-seed/kitchen-supply-20cm-42-142/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-20cm-42-142-detail-2.jpg', '/images/product-seed/kitchen-supply-20cm-42-142/detail-2.jpg', 0, 'DETAIL');

-- [143/150] 내열 유리 밀폐용기 6종세트 프리미엄 43호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '내열 유리 밀폐용기 6종세트 프리미엄 43호', 22600, 54, '<h3>내열 유리 밀폐용기 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 6종세트</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '내열 유리 밀폐용기.jpg', 'kitchen-supply-6-43-143-main-1.jpg', '/images/product-seed/kitchen-supply-6-43-143/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-6-43-143-main-2.jpg', '/images/product-seed/kitchen-supply-6-43-143/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-6-43-143-detail-1.jpg', '/images/product-seed/kitchen-supply-6-43-143/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-6-43-143-detail-2.jpg', '/images/product-seed/kitchen-supply-6-43-143/detail-2.jpg', 0, 'DETAIL');

-- [144/150] 실리콘 조리도구 세트 7종 프리미엄 44호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '실리콘 조리도구 세트 7종 프리미엄 44호', 21300, 71, '<h3>실리콘 조리도구 세트 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 7종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '실리콘 조리도구 세트.jpg', 'kitchen-supply-7-44-144-main-1.jpg', '/images/product-seed/kitchen-supply-7-44-144/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-7-44-144-main-2.jpg', '/images/product-seed/kitchen-supply-7-44-144/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-7-44-144-detail-1.jpg', '/images/product-seed/kitchen-supply-7-44-144/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-7-44-144-detail-2.jpg', '/images/product-seed/kitchen-supply-7-44-144/detail-2.jpg', 0, 'DETAIL');

-- [145/150] 원목 도마 대형 프리미엄 45호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '원목 도마 대형 프리미엄 45호', 28000, 88, '<h3>원목 도마 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 대형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '원목 도마.jpg', 'kitchen-supply-45-145-main-1.jpg', '/images/product-seed/kitchen-supply-45-145/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-45-145-main-2.jpg', '/images/product-seed/kitchen-supply-45-145/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-45-145-detail-1.jpg', '/images/product-seed/kitchen-supply-45-145/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-45-145-detail-2.jpg', '/images/product-seed/kitchen-supply-45-145/detail-2.jpg', 0, 'DETAIL');

-- [146/150] 셰프 나이프 8인치 프리미엄 46호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '셰프 나이프 8인치 프리미엄 46호', 37700, 105, '<h3>셰프 나이프 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 8인치</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '셰프 나이프.jpg', 'kitchen-supply-8-46-146-main-1.jpg', '/images/product-seed/kitchen-supply-8-46-146/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-8-46-146-main-2.jpg', '/images/product-seed/kitchen-supply-8-46-146/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-8-46-146-detail-1.jpg', '/images/product-seed/kitchen-supply-8-46-146/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-8-46-146-detail-2.jpg', '/images/product-seed/kitchen-supply-8-46-146/detail-2.jpg', 0, 'DETAIL');

-- [147/150] 계량컵/스푼 세트 10종 프리미엄 47호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '계량컵/스푼 세트 10종 프리미엄 47호', 16400, 52, '<h3>계량컵/스푼 세트 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 10종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '계량컵/스푼 세트.jpg', 'kitchen-supply-10-47-147-main-1.jpg', '/images/product-seed/kitchen-supply-10-47-147/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-10-47-147-main-2.jpg', '/images/product-seed/kitchen-supply-10-47-147/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-10-47-147-detail-1.jpg', '/images/product-seed/kitchen-supply-10-47-147/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-10-47-147-detail-2.jpg', '/images/product-seed/kitchen-supply-10-47-147/detail-2.jpg', 0, 'DETAIL');

-- [148/150] 스텐 채반볼 세트 3종 프리미엄 48호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '스텐 채반볼 세트 3종 프리미엄 48호', 23900, 69, '<h3>스텐 채반볼 세트 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 3종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '스텐 채반볼 세트.jpg', 'kitchen-supply-3-48-148-main-1.jpg', '/images/product-seed/kitchen-supply-3-48-148/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-3-48-148-main-2.jpg', '/images/product-seed/kitchen-supply-3-48-148/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-3-48-148-detail-1.jpg', '/images/product-seed/kitchen-supply-3-48-148/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-3-48-148-detail-2.jpg', '/images/product-seed/kitchen-supply-3-48-148/detail-2.jpg', 0, 'DETAIL');

-- [149/150] 오븐용 트레이 2종 프리미엄 49호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '오븐용 트레이 2종 프리미엄 49호', 18600, 86, '<h3>오븐용 트레이 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 2종</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '오븐용 트레이.jpg', 'kitchen-supply-2-49-149-main-1.jpg', '/images/product-seed/kitchen-supply-2-49-149/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-2-49-149-main-2.jpg', '/images/product-seed/kitchen-supply-2-49-149/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-2-49-149-detail-1.jpg', '/images/product-seed/kitchen-supply-2-49-149/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-2-49-149-detail-2.jpg', '/images/product-seed/kitchen-supply-2-49-149/detail-2.jpg', 0, 'DETAIL');

-- [150/150] 주방 정리 랙 확장형 프리미엄 50호
INSERT INTO product (category, name, price, stock, detail_content) VALUES ('KITCHEN_SUPPLY', '주방 정리 랙 확장형 프리미엄 50호', 28300, 103, '<h3>주방 정리 랙 프리미엄</h3><p>내구성과 사용성을 고려한 주방용품 라인입니다. 가정용/소규모 업장 모두에 적합합니다.</p><ul><li>규격: 확장형</li><li>소재: 상세페이지 참조</li><li>관리: 세척 후 건조 보관</li></ul>');
SET @pid := LAST_INSERT_ID();
INSERT INTO product_image (product_id, original_name, stored_name, img_url, rep_yn, image_type) VALUES
(@pid, '주방 정리 랙.jpg', 'kitchen-supply-50-150-main-1.jpg', '/images/product-seed/kitchen-supply-50-150/main-1.jpg', 1, 'MAIN'),
(@pid, '실사용 컷.jpg', 'kitchen-supply-50-150-main-2.jpg', '/images/product-seed/kitchen-supply-50-150/main-2.jpg', 0, 'MAIN'),
(@pid, '디테일 확대.jpg', 'kitchen-supply-50-150-detail-1.jpg', '/images/product-seed/kitchen-supply-50-150/detail-1.jpg', 0, 'DETAIL'),
(@pid, '사이즈 정보.jpg', 'kitchen-supply-50-150-detail-2.jpg', '/images/product-seed/kitchen-supply-50-150/detail-2.jpg', 0, 'DETAIL');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
