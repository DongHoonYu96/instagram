import {join} from 'path';

//서버 프로젝트의 루트폴더 절대경로
export const PROJECT_ROOT_PATH = process.cwd();

export const PUBLIC_FOLDER_NAME = 'public';

//포스트 이미지들을 저장할 폴더 이름
export const POSTS_FOLDER_NAME = 'posts';

//임시 폴더이름
export const TEMP_FOLDER_NAME = 'temp';

//공개폴더의 절대경로
// /{}/public
export const PUBLIC_FOLDER_PATH = join(
  PROJECT_ROOT_PATH,
  PUBLIC_FOLDER_NAME
)

//포스트 이미지를 저장할 폴더
/// /{}/public/posts
export const POST_IMAGE_PATH = join(
  PUBLIC_FOLDER_PATH,
  POSTS_FOLDER_NAME
)

// 상대경로
// /public/posts/xxx.jpg
// FE에서 요청시 localhost붙여서 요청하면됨.
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POSTS_FOLDER_NAME,
)

//임시파일들을 저장할 폴더
// /public/temp
export const TEMP_FOLDER_PATH = join(
  PUBLIC_FOLDER_NAME,
  TEMP_FOLDER_NAME,
)